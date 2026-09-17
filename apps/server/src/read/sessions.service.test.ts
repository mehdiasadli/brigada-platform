import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { READ_SESSIONS_REPOSITORY, VOTE_PUBLISHER } from "./read.constants";
import { ReadSessionsService, VOTING_MS } from "./sessions.service";
import type { ReadSessionCandidate, ReadSessionDetail } from "./sessions.types";

const bookId = "33333333-3333-4333-8333-333333333333";
const otherBookId = "44444444-4444-4444-8444-444444444444";
const sessionId = "55555555-5555-4555-8555-555555555555";
const userId = "11111111-1111-4111-8111-111111111111";

const book = {
  id: bookId,
  title: "Dune",
  slug: "dune",
  olibKey: "/works/OL1W",
  author: "Frank Herbert",
  pageCount: 16,
  firstPublishYear: 1965,
  subtitle: null,
  description: null,
  coverId: null,
  status: "readlist" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const candidate: ReadSessionCandidate = {
  id: "66666666-6666-4666-8666-666666666666",
  bookId,
  title: book.title,
  author: book.author,
  pageCount: book.pageCount,
  firstPublishYear: book.firstPublishYear,
  coverId: book.coverId,
  slug: book.slug,
  discordAnswerId: 1,
};

function session(
  overrides: Partial<ReadSessionDetail> = {},
): ReadSessionDetail {
  return {
    id: sessionId,
    bookId: null,
    status: "not_started",
    votingStartedAt: null,
    votingDeadline: null,
    votingEndedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    readingDeadline: null,
    discordPollMessageId: null,
    discordPollChannelId: null,
    midtermPostedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    book: null,
    candidates: [candidate, { ...candidate, id: "c2", bookId: otherBookId }],
    readers: [{ userId, username: "ada", name: "Ada" }],
    ...overrides,
  };
}

function createStore(
  current: ReadSessionDetail,
  overrides: Record<string, ReturnType<typeof mock>> = {},
) {
  return {
    list: mock(() => Promise.resolve([current])),
    findById: mock(() => Promise.resolve(current)),
    findOpen: mock(() => Promise.resolve(null)),
    insert: mock(() => Promise.resolve(current)),
    update: mock(() => Promise.resolve()),
    replaceCandidates: mock(() => Promise.resolve(current.candidates)),
    setCandidateAnswers: mock(() => Promise.resolve()),
    replaceReaders: mock(() => Promise.resolve()),
    removeReader: mock(() => Promise.resolve(true)),
    listMemberIds: mock(() => Promise.resolve([userId])),
    findBooksByIds: mock(() =>
      Promise.resolve([book, { ...book, id: otherBookId }]),
    ),
    listReadlist: mock(() => Promise.resolve([book])),
    setBookStatus: mock(() => Promise.resolve()),
    createProgress: mock(() => Promise.resolve()),
    listProgress: mock(() => Promise.resolve([])),
    findProgress: mock(() => Promise.resolve(null)),
    updateProgress: mock(() =>
      Promise.resolve({
        id: "p1",
        sessionId,
        userId,
        percentage: 100,
        notes: null,
        isCompleted: true,
        startedAt: new Date(),
        completedAt: new Date(),
        progressUpdatedAt: new Date(),
      }),
    ),
    findCompletedProgressForBook: mock(() => Promise.resolve(null)),
    insertReview: mock(() =>
      Promise.resolve({
        id: "r1",
        bookId,
        userId,
        body: null,
        rating: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
    findReview: mock(() => Promise.resolve(null)),
    ...overrides,
  };
}

async function createService(
  store: ReturnType<typeof createStore>,
  postPoll = mock(() =>
    Promise.resolve({
      messageId: "m1",
      channelId: "c1",
      answers: [{ candidateId: candidate.id, answerId: 1 }],
    }),
  ),
) {
  const module = await Test.createTestingModule({
    providers: [
      ReadSessionsService,
      { provide: READ_SESSIONS_REPOSITORY, useValue: store },
      { provide: VOTE_PUBLISHER, useValue: { postPoll } },
    ],
  }).compile();

  return module.get(ReadSessionsService);
}

test("refuses a second open session", async () => {
  const current = session();
  const service = await createService(
    createStore(current, { findOpen: mock(() => Promise.resolve(current)) }),
  );

  await expect(service.create()).rejects.toBeInstanceOf(ConflictException);
});

test("starts voting with every current member", async () => {
  const store = createStore(session());
  const service = await createService(store);
  const now = new Date("2026-09-14T10:00:00.000Z");

  await service.startVoting(sessionId, now);

  expect(store.replaceReaders).toHaveBeenCalledWith(sessionId, [userId]);
  expect(store.update).toHaveBeenCalledWith(
    sessionId,
    expect.objectContaining({
      status: "voting",
      votingStartedAt: now,
      votingDeadline: new Date(now.getTime() + VOTING_MS),
    }),
  );
});

test("resolves a vote into an active session with a deadline", async () => {
  const store = createStore(session({ status: "voting" }));
  const service = await createService(store);
  const now = new Date("2026-09-14T10:00:00.000Z");

  await service.resolveVoting(sessionId, { winnerBookId: bookId }, now);

  expect(store.setBookStatus).toHaveBeenCalledWith(bookId, "reading");
  expect(store.createProgress).toHaveBeenCalledWith(sessionId, [userId]);
  expect(store.update).toHaveBeenCalledWith(
    sessionId,
    expect.objectContaining({
      bookId,
      status: "active",
      readingDeadline: new Date("2026-09-14T00:00:00.000Z"),
    }),
  );
});

test("rejects resolving without a winner", async () => {
  const service = await createService(
    createStore(session({ status: "voting" })),
  );

  await expect(service.resolveVoting(sessionId, {})).rejects.toBeInstanceOf(
    BadRequestException,
  );
});

test("completes when every reader is done", async () => {
  const store = createStore(session({ status: "active", bookId }), {
    listProgress: mock(() =>
      Promise.resolve([{ isCompleted: true }, { isCompleted: true }]),
    ),
  });
  const service = await createService(store);

  await service.completeIfDue(sessionId);

  expect(store.update).toHaveBeenCalledWith(
    sessionId,
    expect.objectContaining({ status: "completed" }),
  );
});
