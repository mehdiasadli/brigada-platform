import { db } from "@brigada/db";
import {
  readBook,
  readMember,
  readProgress,
  readReview,
  readSession,
  readSessionCandidate,
  readSessionReader,
  user,
} from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { ReadBook } from "./books.types";
import type {
  ReadProgress,
  ReadReview,
  ReadSession,
  ReadSessionCandidate,
  ReadSessionDetail,
  ReadSessionReader,
  ReadSessionsStore,
} from "./sessions.types";
import { OPEN_SESSION_STATUSES } from "./sessions.types";

const sessionColumns = {
  id: readSession.id,
  bookId: readSession.bookId,
  status: readSession.status,
  votingStartedAt: readSession.votingStartedAt,
  votingDeadline: readSession.votingDeadline,
  votingEndedAt: readSession.votingEndedAt,
  startedAt: readSession.startedAt,
  completedAt: readSession.completedAt,
  cancelledAt: readSession.cancelledAt,
  readingDeadline: readSession.readingDeadline,
  discordPollMessageId: readSession.discordPollMessageId,
  discordPollChannelId: readSession.discordPollChannelId,
  midtermPostedAt: readSession.midtermPostedAt,
  createdAt: readSession.createdAt,
  updatedAt: readSession.updatedAt,
} as const;

const bookColumns = {
  id: readBook.id,
  title: readBook.title,
  slug: readBook.slug,
  olibKey: readBook.olibKey,
  author: readBook.author,
  pageCount: readBook.pageCount,
  firstPublishYear: readBook.firstPublishYear,
  subtitle: readBook.subtitle,
  description: readBook.description,
  coverId: readBook.coverId,
  status: readBook.status,
  createdAt: readBook.createdAt,
  updatedAt: readBook.updatedAt,
} as const;

const progressColumns = {
  id: readProgress.id,
  sessionId: readProgress.sessionId,
  userId: readProgress.userId,
  percentage: readProgress.percentage,
  notes: readProgress.notes,
  isCompleted: readProgress.isCompleted,
  startedAt: readProgress.startedAt,
  completedAt: readProgress.completedAt,
  progressUpdatedAt: readProgress.progressUpdatedAt,
} as const;

@Injectable()
export class ReadSessionsRepository implements ReadSessionsStore {
  async list() {
    return (await db
      .select(sessionColumns)
      .from(readSession)
      .orderBy(desc(readSession.createdAt))) as ReadSession[];
  }

  async findById(id: string): Promise<ReadSessionDetail | null> {
    const [row] = await db
      .select(sessionColumns)
      .from(readSession)
      .where(eq(readSession.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const [book, candidates, readers, progress] = await Promise.all([
      row.bookId ? this.findBook(row.bookId) : Promise.resolve(null),
      this.listCandidates(id),
      this.listReaders(id),
      this.listProgress(id),
    ]);
    const reviews = book ? await this.listReviewsByBook(book.id) : [];
    const progressByUser = new Map(
      progress.map((item) => [item.userId, item] as const),
    );
    const reviewByUser = new Map(
      reviews.map((item) => [item.userId, item] as const),
    );

    return {
      ...(row as ReadSession),
      book,
      candidates,
      readers: readers.map((reader) => {
        const rowProgress = progressByUser.get(reader.userId);
        const rowReview = reviewByUser.get(reader.userId);
        return {
          ...reader,
          progress: rowProgress
            ? {
                percentage: rowProgress.percentage,
                notes: rowProgress.notes,
                isCompleted: rowProgress.isCompleted,
                startedAt: rowProgress.startedAt,
                completedAt: rowProgress.completedAt,
                progressUpdatedAt: rowProgress.progressUpdatedAt,
              }
            : null,
          review: rowReview
            ? { rating: rowReview.rating, body: rowReview.body }
            : null,
        };
      }),
    };
  }

  async findOpen() {
    const [row] = await db
      .select(sessionColumns)
      .from(readSession)
      .where(inArray(readSession.status, [...OPEN_SESSION_STATUSES]))
      .limit(1);

    return (row as ReadSession | undefined) ?? null;
  }

  async insert() {
    const [row] = await db
      .insert(readSession)
      .values({})
      .returning(sessionColumns);
    if (!row) {
      throw new Error("Failed to create session");
    }

    return row as ReadSession;
  }

  async update(id: string, patch: Parameters<ReadSessionsStore["update"]>[1]) {
    await db.update(readSession).set(patch).where(eq(readSession.id, id));
  }

  async replaceCandidates(sessionId: string, books: ReadBook[]) {
    await db
      .delete(readSessionCandidate)
      .where(eq(readSessionCandidate.sessionId, sessionId));

    if (books.length === 0) {
      return [];
    }

    const rows = await db
      .insert(readSessionCandidate)
      .values(
        books.map((book) => ({
          sessionId,
          bookId: book.id,
          title: book.title,
          author: book.author,
          pageCount: book.pageCount,
          firstPublishYear: book.firstPublishYear,
        })),
      )
      .returning();

    return rows.map((row) => {
      const book = books.find((item) => item.id === row.bookId);
      return toCandidate(row, book?.coverId ?? null, book?.slug ?? null);
    });
  }

  async setCandidateAnswers(
    answers: Array<{ candidateId: string; answerId: number }>,
  ) {
    await Promise.all(
      answers.map((answer) =>
        db
          .update(readSessionCandidate)
          .set({ discordAnswerId: answer.answerId })
          .where(eq(readSessionCandidate.id, answer.candidateId)),
      ),
    );
  }

  async replaceReaders(sessionId: string, userIds: string[]) {
    await db
      .delete(readSessionReader)
      .where(eq(readSessionReader.sessionId, sessionId));

    if (userIds.length === 0) {
      return;
    }

    await db
      .insert(readSessionReader)
      .values(userIds.map((userId) => ({ sessionId, userId })));
  }

  async removeReader(sessionId: string, userId: string) {
    const deleted = await db
      .delete(readSessionReader)
      .where(
        and(
          eq(readSessionReader.sessionId, sessionId),
          eq(readSessionReader.userId, userId),
        ),
      )
      .returning({ id: readSessionReader.id });

    return deleted.length > 0;
  }

  async listMemberIds() {
    const rows = await db
      .select({ userId: readMember.userId })
      .from(readMember);
    return rows.map((row) => row.userId);
  }

  async findBooksByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    return (await db
      .select(bookColumns)
      .from(readBook)
      .where(inArray(readBook.id, ids))) as ReadBook[];
  }

  async listReadlist() {
    return (await db
      .select(bookColumns)
      .from(readBook)
      .where(eq(readBook.status, "readlist"))
      .orderBy(readBook.title)) as ReadBook[];
  }

  async setBookStatus(bookId: string, status: ReadBook["status"]) {
    await db.update(readBook).set({ status }).where(eq(readBook.id, bookId));
  }

  async createProgress(sessionId: string, userIds: string[]) {
    if (userIds.length === 0) {
      return;
    }

    await db
      .insert(readProgress)
      .values(userIds.map((userId) => ({ sessionId, userId })));
  }

  async listProgress(sessionId: string) {
    return (await db
      .select(progressColumns)
      .from(readProgress)
      .where(eq(readProgress.sessionId, sessionId))) as ReadProgress[];
  }

  async findProgress(sessionId: string, userId: string) {
    const [row] = await db
      .select(progressColumns)
      .from(readProgress)
      .where(
        and(
          eq(readProgress.sessionId, sessionId),
          eq(readProgress.userId, userId),
        ),
      )
      .limit(1);

    return (row as ReadProgress | undefined) ?? null;
  }

  async updateProgress(
    sessionId: string,
    userId: string,
    patch: Parameters<ReadSessionsStore["updateProgress"]>[2],
  ) {
    const [row] = await db
      .update(readProgress)
      .set({ ...patch, progressUpdatedAt: new Date() })
      .where(
        and(
          eq(readProgress.sessionId, sessionId),
          eq(readProgress.userId, userId),
        ),
      )
      .returning(progressColumns);

    return (row as ReadProgress | undefined) ?? null;
  }

  async findProgressForBook(userId: string, bookId: string) {
    const [row] = await db
      .select(progressColumns)
      .from(readProgress)
      .innerJoin(readSession, eq(readSession.id, readProgress.sessionId))
      .where(
        and(
          eq(readProgress.userId, userId),
          eq(readSession.bookId, bookId),
          inArray(readSession.status, ["active", "completed"]),
        ),
      )
      .orderBy(desc(readSession.updatedAt))
      .limit(1);

    return (row as ReadProgress | undefined) ?? null;
  }

  async findCompletedProgressForBook(userId: string, bookId: string) {
    const [row] = await db
      .select(progressColumns)
      .from(readProgress)
      .innerJoin(readSession, eq(readSession.id, readProgress.sessionId))
      .where(
        and(
          eq(readProgress.userId, userId),
          eq(readProgress.isCompleted, true),
          eq(readSession.bookId, bookId),
        ),
      )
      .limit(1);

    return (row as ReadProgress | undefined) ?? null;
  }

  async insertReview(input: {
    bookId: string;
    userId: string;
    body: string | null;
    rating: number;
  }) {
    const [row] = await db.insert(readReview).values(input).returning();
    if (!row) {
      throw new Error("Failed to create review");
    }

    return row as ReadReview;
  }

  async findReview(userId: string, bookId: string) {
    const [row] = await db
      .select()
      .from(readReview)
      .where(and(eq(readReview.userId, userId), eq(readReview.bookId, bookId)))
      .limit(1);

    return (row as ReadReview | undefined) ?? null;
  }

  private async findBook(id: string) {
    const [row] = await db
      .select(bookColumns)
      .from(readBook)
      .where(eq(readBook.id, id))
      .limit(1);

    return (row as ReadBook | undefined) ?? null;
  }

  private async listCandidates(sessionId: string) {
    const rows = await db
      .select({
        candidate: readSessionCandidate,
        coverId: readBook.coverId,
        slug: readBook.slug,
      })
      .from(readSessionCandidate)
      .innerJoin(readBook, eq(readBook.id, readSessionCandidate.bookId))
      .where(eq(readSessionCandidate.sessionId, sessionId));

    return rows.map((row) => toCandidate(row.candidate, row.coverId, row.slug));
  }

  private async listReviewsByBook(bookId: string) {
    return db
      .select({
        userId: readReview.userId,
        rating: readReview.rating,
        body: readReview.body,
      })
      .from(readReview)
      .where(eq(readReview.bookId, bookId));
  }

  private async listReaders(sessionId: string) {
    return (await db
      .select({
        userId: readSessionReader.userId,
        username: user.username,
        name: user.name,
      })
      .from(readSessionReader)
      .innerJoin(user, eq(user.id, readSessionReader.userId))
      .where(eq(readSessionReader.sessionId, sessionId))) as Array<
      Omit<ReadSessionReader, "progress" | "review">
    >;
  }
}

function toCandidate(
  row: typeof readSessionCandidate.$inferSelect,
  coverId: number | null,
  slug: string | null,
): ReadSessionCandidate {
  return {
    id: row.id,
    bookId: row.bookId,
    title: row.title,
    author: row.author,
    pageCount: row.pageCount,
    firstPublishYear: row.firstPublishYear,
    coverId,
    slug,
    discordAnswerId: row.discordAnswerId,
  };
}
