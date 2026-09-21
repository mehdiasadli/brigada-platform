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
    readers: [
      {
        userId,
        username: "ada",
        name: "Ada",
        image: null,
        progress: null,
        review: null,
      },
    ],
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
    findProgressForBook: mock(() => Promise.resolve(null)),
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
    updateReview: mock(() =>
      Promise.resolve({
        id: "r1",
        bookId,
        userId,
        body: "fixed",
        rating: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ),
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

test("rejects a finished book on the slate", async () => {
  const service = await createService(
    createStore(session(), {
      findBooksByIds: mock(() =>
        Promise.resolve([
          { ...book, status: "completed" as const },
          { ...book, id: otherBookId },
        ]),
      ),
    }),
  );

  await expect(
    service.setSlate(sessionId, [bookId, otherBookId]),
  ).rejects.toBeInstanceOf(BadRequestException);
});

test("lets an admin correct reader progress", async () => {
  const store = createStore(session({ status: "active", bookId }));
  const service = await createService(store);

  await service.setReaderProgress(sessionId, userId, {
    percentage: 40,
    notes: "chapter 4",
  });

  expect(store.updateProgress).toHaveBeenCalledWith(
    sessionId,
    userId,
    expect.objectContaining({
      percentage: 40,
      notes: "chapter 4",
      isCompleted: false,
    }),
  );
});

test("lets a reader finish after the session ended", async () => {
  const progress = {
    id: "p1",
    sessionId,
    userId,
    percentage: 40,
    notes: null,
    isCompleted: false,
    startedAt: new Date("2026-09-01"),
    completedAt: null,
    progressUpdatedAt: new Date("2026-09-01"),
  };
  const store = createStore(
    session({
      status: "completed",
      bookId,
      book: { ...book, status: "completed" },
    }),
    { findProgressForBook: mock(() => Promise.resolve(progress)) },
  );
  const service = await createService(store);

  await service.setProgress(userId, { bookId, percentage: 100 });

  expect(store.updateProgress).toHaveBeenCalledWith(
    sessionId,
    userId,
    expect.objectContaining({
      percentage: 100,
      isCompleted: true,
    }),
  );
});

test("rejects progress without a book after the session ended", async () => {
  const service = await createService(
    createStore(session({ status: "completed", bookId })),
  );

  await expect(
    service.setProgress(userId, { percentage: 100 }),
  ).rejects.toBeInstanceOf(ConflictException);
});

test("clears completion when progress drops below 100 and keeps notes", async () => {
  const progress = {
    id: "p1",
    sessionId,
    userId,
    percentage: 100,
    notes: "loved the ending",
    isCompleted: true,
    startedAt: new Date("2026-09-01"),
    completedAt: new Date("2026-09-10"),
    progressUpdatedAt: new Date("2026-09-10"),
  };
  const store = createStore(
    session({
      status: "completed",
      bookId,
      book: { ...book, status: "completed" },
    }),
    { findProgressForBook: mock(() => Promise.resolve(progress)) },
  );
  const service = await createService(store);

  await service.setProgress(userId, {
    bookId,
    percentage: 99,
    notes: "loved the ending",
  });

  expect(store.updateProgress).toHaveBeenCalledWith(
    sessionId,
    userId,
    expect.objectContaining({
      percentage: 99,
      notes: "loved the ending",
      isCompleted: false,
      completedAt: null,
    }),
  );
});

test("reads progress for a finished book when given a book id", async () => {
  const progress = {
    id: "p1",
    sessionId,
    userId,
    percentage: 100,
    notes: null,
    isCompleted: true,
    startedAt: new Date("2026-09-01"),
    completedAt: new Date("2026-09-10"),
    progressUpdatedAt: new Date("2026-09-10"),
  };
  const store = createStore(session({ status: "completed", bookId }), {
    findProgressForBook: mock(() => Promise.resolve(progress)),
  });
  const service = await createService(store);

  await expect(service.memberProgress(userId, bookId)).resolves.toMatchObject({
    percentage: 100,
  });
  await expect(service.memberProgress(userId)).resolves.toBeNull();
});

test("accepts a review once the club has started the book", async () => {
  const store = createStore(session({ status: "active", bookId }), {
    findBooksByIds: mock(() =>
      Promise.resolve([{ ...book, status: "reading" as const }]),
    ),
  });
  const service = await createService(store);

  await expect(
    service.createReview(userId, { bookId, rating: 8 }),
  ).resolves.toMatchObject({ rating: 8 });
});

test("updates the author's review", async () => {
  const existing = {
    id: "r1",
    bookId,
    userId,
    body: "typo",
    rating: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const store = createStore(session({ status: "completed", bookId }), {
    findBooksByIds: mock(() =>
      Promise.resolve([{ ...book, status: "completed" as const }]),
    ),
    findReview: mock(() => Promise.resolve(existing)),
  });
  const service = await createService(store);

  await expect(
    service.updateReview(userId, { bookId, rating: 6, body: "fixed" }),
  ).resolves.toMatchObject({ rating: 6, body: "fixed" });
  expect(store.updateReview).toHaveBeenCalledWith(userId, bookId, {
    rating: 6,
    body: "fixed",
  });
});

test("rejects a review edit when the member has not reviewed the book", async () => {
  const store = createStore(session({ status: "active", bookId }), {
    findBooksByIds: mock(() =>
      Promise.resolve([{ ...book, status: "reading" as const }]),
    ),
  });
  const service = await createService(store);

  await expect(
    service.updateReview(userId, { bookId, rating: 6 }),
  ).rejects.toBeInstanceOf(ConflictException);
});

test("lists member sessions without private notes", async () => {
  const current = session({
    status: "completed",
    bookId,
    book: { ...book, status: "completed" },
    readers: [
      {
        userId,
        username: "ada",
        name: "Ada",
        image: null,
        progress: {
          percentage: 100,
          notes: "secret",
          isCompleted: true,
          startedAt: null,
          completedAt: null,
          progressUpdatedAt: new Date("2026-09-01"),
        },
        review: { rating: 8, body: "secret body" },
      },
    ],
  });
  const service = await createService(createStore(current));

  const listed = await service.listForMembers();
  expect(listed).toEqual([
    expect.objectContaining({
      id: sessionId,
      status: "completed",
      readerCount: 1,
      averageRating: 8,
    }),
  ]);
  expect(JSON.stringify(listed)).not.toContain("secret");
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
