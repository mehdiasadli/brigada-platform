import type { READ_SESSION_STATUS_VALUES } from "@brigada/db/schema";
import type { ReadBook } from "./books.types";

export type ReadSessionStatus = (typeof READ_SESSION_STATUS_VALUES)[number];

export type ReadSessionCandidate = {
  id: string;
  bookId: string;
  title: string;
  author: string;
  pageCount: number;
  firstPublishYear: number;
  coverId: number | null;
  slug: string | null;
  discordAnswerId: number | null;
};

export type ReadSessionReaderProgress = {
  percentage: number;
  notes: string | null;
  isCompleted: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  progressUpdatedAt: Date;
};

export type ReadSessionReaderReview = {
  rating: number;
  body: string | null;
};

export type ReadSessionReader = {
  userId: string;
  username: string;
  name: string;
  image: string | null;
  progress: ReadSessionReaderProgress | null;
  review: ReadSessionReaderReview | null;
};

export type ReadSession = {
  id: string;
  bookId: string | null;
  status: ReadSessionStatus;
  votingStartedAt: Date | null;
  votingDeadline: Date | null;
  votingEndedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  readingDeadline: Date | null;
  discordPollMessageId: string | null;
  discordPollChannelId: string | null;
  midtermPostedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadSessionDetail = ReadSession & {
  book: ReadBook | null;
  candidates: ReadSessionCandidate[];
  readers: ReadSessionReader[];
};

export type ReadProgress = {
  id: string;
  sessionId: string;
  userId: string;
  percentage: number;
  notes: string | null;
  isCompleted: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  progressUpdatedAt: Date;
};

export type ReadReview = {
  id: string;
  bookId: string;
  userId: string;
  body: string | null;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
};

export const OPEN_SESSION_STATUSES = [
  "not_started",
  "voting",
  "active",
] as const satisfies ReadSessionStatus[];

export type ReadSessionsStore = {
  list(): Promise<ReadSession[]>;
  findById(id: string): Promise<ReadSessionDetail | null>;
  findOpen(): Promise<ReadSession | null>;
  insert(): Promise<ReadSession>;
  update(
    id: string,
    patch: Partial<
      Pick<
        ReadSession,
        | "bookId"
        | "status"
        | "votingStartedAt"
        | "votingDeadline"
        | "votingEndedAt"
        | "startedAt"
        | "completedAt"
        | "cancelledAt"
        | "readingDeadline"
        | "discordPollMessageId"
        | "discordPollChannelId"
        | "midtermPostedAt"
      >
    >,
  ): Promise<void>;
  replaceCandidates(
    sessionId: string,
    books: ReadBook[],
  ): Promise<ReadSessionCandidate[]>;
  setCandidateAnswers(
    answers: Array<{ candidateId: string; answerId: number }>,
  ): Promise<void>;
  replaceReaders(sessionId: string, userIds: string[]): Promise<void>;
  removeReader(sessionId: string, userId: string): Promise<boolean>;
  listMemberIds(): Promise<string[]>;
  findBooksByIds(ids: string[]): Promise<ReadBook[]>;
  listReadlist(): Promise<ReadBook[]>;
  setBookStatus(bookId: string, status: ReadBook["status"]): Promise<void>;
  createProgress(sessionId: string, userIds: string[]): Promise<void>;
  listProgress(sessionId: string): Promise<ReadProgress[]>;
  findProgress(sessionId: string, userId: string): Promise<ReadProgress | null>;
  updateProgress(
    sessionId: string,
    userId: string,
    patch: {
      percentage: number;
      notes: string | null;
      isCompleted: boolean;
      startedAt: Date | null;
      completedAt: Date | null;
    },
  ): Promise<ReadProgress | null>;
  findProgressForBook(
    userId: string,
    bookId: string,
  ): Promise<ReadProgress | null>;
  findCompletedProgressForBook(
    userId: string,
    bookId: string,
  ): Promise<ReadProgress | null>;
  insertReview(input: {
    bookId: string;
    userId: string;
    body: string | null;
    rating: number;
  }): Promise<ReadReview>;
  updateReview(
    userId: string,
    bookId: string,
    patch: { rating: number; body: string | null },
  ): Promise<ReadReview | null>;
  findReview(userId: string, bookId: string): Promise<ReadReview | null>;
};
