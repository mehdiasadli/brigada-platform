import { calculateReadingDeadline } from "@brigada/db/read";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ReadBook } from "./books.types";
import { READ_SESSIONS_REPOSITORY, VOTE_PUBLISHER } from "./read.constants";
import type { ReadSessionDetail, ReadSessionsStore } from "./sessions.types";
import type { VotePublisher } from "./vote-publisher";

export const VOTING_HOURS = 12;
export const VOTING_MS = VOTING_HOURS * 60 * 60 * 1000;
export const MIN_CANDIDATES = 2;
export const MAX_CANDIDATES = 10;

@Injectable()
export class ReadSessionsService {
  constructor(
    @Inject(READ_SESSIONS_REPOSITORY)
    private readonly sessions: ReadSessionsStore,
    @Inject(VOTE_PUBLISHER) private readonly votes: VotePublisher,
  ) {}

  list() {
    return this.sessions.list();
  }

  markMidtermPosted(sessionId: string, now = new Date()) {
    return this.sessions.update(sessionId, { midtermPostedAt: now });
  }

  suggest() {
    return this.sessions.listReadlist();
  }

  async getById(id: string) {
    const session = await this.sessions.findById(id);
    if (!session) {
      throw new NotFoundException("Session not found");
    }

    return session;
  }

  async create() {
    if (await this.sessions.findOpen()) {
      throw new ConflictException("An open reading session already exists");
    }

    return this.sessions.insert();
  }

  async setSlate(sessionId: string, bookIds: string[]) {
    const session = await this.getById(sessionId);
    if (session.status !== "not_started") {
      throw new ConflictException("Slate can only change before voting starts");
    }

    if (
      bookIds.length < MIN_CANDIDATES ||
      bookIds.length > MAX_CANDIDATES ||
      new Set(bookIds).size !== bookIds.length
    ) {
      throw new BadRequestException("Slate must be 2–10 unique books");
    }

    const books = await this.sessions.findBooksByIds(bookIds);
    if (books.length !== bookIds.length) {
      throw new NotFoundException("One or more books were not found");
    }

    const blocked = books.find((book) => book.status !== "readlist");
    if (blocked) {
      throw new BadRequestException("Only unread list books can be nominated");
    }

    await this.sessions.replaceCandidates(
      sessionId,
      orderBooks(books, bookIds),
    );
    return this.getById(sessionId);
  }

  async startVoting(sessionId: string, now = new Date()) {
    const session = await this.getById(sessionId);
    if (session.status !== "not_started") {
      throw new ConflictException("Voting already started");
    }

    if (session.candidates.length < MIN_CANDIDATES) {
      throw new BadRequestException("Add at least two candidates first");
    }

    const memberIds = await this.sessions.listMemberIds();
    if (memberIds.length === 0) {
      throw new BadRequestException("Grant Read membership before voting");
    }

    const published = await this.votes.postPoll(session.candidates);
    await this.sessions.replaceReaders(sessionId, memberIds);
    await this.sessions.setCandidateAnswers(published.answers);
    await this.sessions.update(sessionId, {
      status: "voting",
      votingStartedAt: now,
      votingDeadline: new Date(now.getTime() + VOTING_MS),
      discordPollMessageId: published.messageId,
      discordPollChannelId: published.channelId,
    });

    return this.getById(sessionId);
  }

  async removeReader(sessionId: string, userId: string) {
    const session = await this.getById(sessionId);
    if (session.status === "active" || session.status === "completed") {
      throw new ConflictException("Roster is frozen after the session starts");
    }

    if (session.status === "cancelled") {
      throw new ConflictException("Session is cancelled");
    }

    const removed = await this.sessions.removeReader(sessionId, userId);
    if (!removed) {
      throw new NotFoundException("Reader not found");
    }

    return this.getById(sessionId);
  }

  async resolveVoting(
    sessionId: string,
    input: { winnerBookId?: string; random?: boolean },
    now = new Date(),
  ) {
    const session = await this.getById(sessionId);
    if (session.status !== "voting") {
      throw new ConflictException("Session is not voting");
    }

    const winner = pickWinner(session, input);
    const startedAt = now;
    const readingDeadline = calculateReadingDeadline(
      winner.pageCount,
      startedAt,
    );

    await this.sessions.update(sessionId, {
      bookId: winner.bookId,
      status: "active",
      votingEndedAt: now,
      startedAt,
      readingDeadline,
    });
    await this.sessions.setBookStatus(winner.bookId, "reading");
    await this.sessions.createProgress(
      sessionId,
      session.readers.map((reader) => reader.userId),
    );

    return this.getById(sessionId);
  }

  async cancel(sessionId: string, now = new Date()) {
    const session = await this.getById(sessionId);
    if (session.status === "completed" || session.status === "cancelled") {
      throw new ConflictException("Session already ended");
    }

    await this.sessions.update(sessionId, {
      status: "cancelled",
      cancelledAt: now,
    });

    if (session.bookId && session.status === "active") {
      await this.sessions.setBookStatus(session.bookId, "readlist");
    }

    return this.getById(sessionId);
  }

  async complete(sessionId: string, now = new Date()) {
    const session = await this.getById(sessionId);
    if (session.status !== "active") {
      throw new ConflictException("Only an active session can complete");
    }

    if (!session.bookId) {
      throw new ConflictException("Session has no book");
    }

    await this.sessions.update(sessionId, {
      status: "completed",
      completedAt: now,
    });
    await this.sessions.setBookStatus(session.bookId, "completed");

    return this.getById(sessionId);
  }

  async completeIfDue(sessionId: string, now = new Date()) {
    const session = await this.getById(sessionId);
    if (session.status !== "active") {
      return session;
    }

    const progress = await this.sessions.listProgress(sessionId);
    const allDone =
      progress.length > 0 && progress.every((row) => row.isCompleted);
    const deadlineHit =
      session.readingDeadline !== null && now > session.readingDeadline;

    if (allDone || deadlineHit) {
      return this.complete(sessionId, now);
    }

    return session;
  }

  async currentForMember(userId: string) {
    const open = await this.sessions.findOpen();
    if (!open) {
      return null;
    }

    const session = await this.getById(open.id);
    const progress = await this.sessions.findProgress(open.id, userId);
    const review = session.bookId
      ? await this.sessions.findReview(userId, session.bookId)
      : null;
    const canReview =
      Boolean(session.book) &&
      !review &&
      (session.book?.status === "reading" ||
        session.book?.status === "completed");

    return { session, progress, canReview };
  }

  async setReaderProgress(
    sessionId: string,
    userId: string,
    input: { percentage: number; notes?: string | null },
    now = new Date(),
  ) {
    const session = await this.getById(sessionId);
    if (session.status !== "active" && session.status !== "completed") {
      throw new ConflictException(
        "Progress can only be edited after the book is picked",
      );
    }

    if (!session.readers.some((reader) => reader.userId === userId)) {
      throw new NotFoundException("Reader not found");
    }

    const current = await this.sessions.findProgress(sessionId, userId);
    const isCompleted = input.percentage >= 100;
    const updated = await this.sessions.updateProgress(sessionId, userId, {
      percentage: input.percentage,
      notes: input.notes ?? current?.notes ?? null,
      isCompleted,
      startedAt: current?.startedAt ?? now,
      completedAt: isCompleted ? (current?.completedAt ?? now) : null,
    });

    if (!updated) {
      throw new NotFoundException("Progress not found");
    }

    if (session.status === "active") {
      await this.completeIfDue(sessionId, now);
    }

    return this.getById(sessionId);
  }

  async setProgress(
    userId: string,
    input: { bookId?: string; percentage: number; notes?: string | null },
    now = new Date(),
  ) {
    const target = input.bookId
      ? await this.progressForBook(userId, input.bookId)
      : await this.currentForMember(userId);

    if (!target?.session || !target.progress) {
      throw new ConflictException("No progress to update");
    }

    if (
      target.session.status !== "active" &&
      target.session.status !== "completed"
    ) {
      throw new ConflictException("No active session");
    }

    if (!target.session.readers.some((reader) => reader.userId === userId)) {
      throw new ConflictException("You are not in this session");
    }

    const isCompleted = input.percentage >= 100;
    const updated = await this.sessions.updateProgress(
      target.session.id,
      userId,
      {
        percentage: input.percentage,
        notes: input.notes ?? null,
        isCompleted,
        startedAt: target.progress.startedAt ?? now,
        completedAt: isCompleted ? (target.progress.completedAt ?? now) : null,
      },
    );

    if (!updated) {
      throw new NotFoundException("Progress not found");
    }

    if (target.session.status === "active") {
      await this.completeIfDue(target.session.id, now);
    }

    return updated;
  }

  private async progressForBook(userId: string, bookId: string) {
    const progress = await this.sessions.findProgressForBook(userId, bookId);
    if (!progress) {
      return null;
    }

    const session = await this.getById(progress.sessionId);
    return { session, progress };
  }

  async createReview(
    userId: string,
    input: { bookId: string; rating: number; body?: string | null },
  ) {
    const [book] = await this.sessions.findBooksByIds([input.bookId]);
    if (!book || book.status === "removed") {
      throw new NotFoundException("Book not found");
    }

    if (book.status !== "reading" && book.status !== "completed") {
      throw new ConflictException(
        "Reviews open after the club starts this book",
      );
    }

    if (await this.sessions.findReview(userId, input.bookId)) {
      throw new ConflictException("You already reviewed this book");
    }

    return this.sessions.insertReview({
      bookId: input.bookId,
      userId,
      body: input.body ?? null,
      rating: input.rating,
    });
  }
}

function orderBooks(books: ReadBook[], bookIds: string[]) {
  const byId = new Map(books.map((book) => [book.id, book]));
  return bookIds.map((id) => byId.get(id)).filter((book) => book !== undefined);
}

function pickWinner(
  session: ReadSessionDetail,
  input: { winnerBookId?: string; random?: boolean },
) {
  if (input.winnerBookId) {
    const winner = session.candidates.find(
      (candidate) => candidate.bookId === input.winnerBookId,
    );
    if (!winner) {
      throw new BadRequestException("Winner is not on the slate");
    }

    return winner;
  }

  if (input.random) {
    const index = Math.floor(Math.random() * session.candidates.length);
    const winner = session.candidates[index];
    if (!winner) {
      throw new BadRequestException("Slate is empty");
    }

    return winner;
  }

  throw new BadRequestException("Choose a winner or pick randomly");
}
