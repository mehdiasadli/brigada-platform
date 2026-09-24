import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ReadBooksService } from "./books.service";
import type { ReadBook } from "./books.types";
import { ReadNominationsService } from "./nominations.service";
import type { ReadNomination } from "./nominations.types";
import {
  OPEN_LIBRARY,
  READ_BOOKS_REPOSITORY,
  READ_NOMINATIONS_REPOSITORY,
} from "./read.constants";

const userId = "11111111-1111-4111-8111-111111111111";

const book: ReadBook = {
  id: "22222222-2222-4222-8222-222222222222",
  title: "The Hobbit",
  slug: "the-hobbit",
  olibKey: "/works/OL45883W",
  author: "J.R.R. Tolkien",
  pageCount: 310,
  firstPublishYear: 1937,
  subtitle: null,
  description: null,
  coverId: 1,
  status: "readlist",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

const nomination: ReadNomination = {
  id: "33333333-3333-4333-8333-333333333333",
  bookId: book.id,
  userId,
  reason: "We never finished it.",
  status: "open",
  createdAt: new Date("2026-02-01"),
  updatedAt: new Date("2026-02-01"),
};

const hit = {
  olibKey: book.olibKey,
  title: book.title,
  author: book.author,
  pageCount: book.pageCount,
  firstPublishYear: book.firstPublishYear,
  subtitle: null as string | null,
  coverId: 1 as number | null,
  reason: nomination.reason,
};

function createBookStore(
  overrides: Record<string, ReturnType<typeof mock>> = {},
) {
  return {
    list: mock(() => Promise.resolve([])),
    listVisible: mock(() => Promise.resolve([])),
    listCatalog: mock(() => Promise.resolve({ items: [], nextCursor: null })),
    findById: mock(() => Promise.resolve(book)),
    findBySlug: mock(() => Promise.resolve(book)),
    findByOlibKey: mock(() => Promise.resolve(null)),
    listSlugs: mock(() => Promise.resolve([])),
    insert: mock(() => Promise.resolve(book)),
    update: mock(() => Promise.resolve(book)),
    listReviews: mock(() => Promise.resolve([])),
    findReview: mock(() => Promise.resolve(null)),
    hasCompletedBook: mock(() => Promise.resolve(false)),
    findProgressForBook: mock(() => Promise.resolve(null)),
    ...overrides,
  };
}

function createNominationStore(
  overrides: Record<string, ReturnType<typeof mock>> = {},
) {
  return {
    findOpenByBookId: mock(() => Promise.resolve(null)),
    findById: mock(() => Promise.resolve(nomination)),
    insert: mock(() => Promise.resolve(nomination)),
    updateStatus: mock(() =>
      Promise.resolve({ ...nomination, status: "parked" as const }),
    ),
    listOpen: mock(() => Promise.resolve([])),
    ...overrides,
  };
}

async function createService(
  bookStore: ReturnType<typeof createBookStore>,
  nominationStore: ReturnType<typeof createNominationStore>,
) {
  const module = await Test.createTestingModule({
    providers: [
      ReadNominationsService,
      ReadBooksService,
      { provide: READ_BOOKS_REPOSITORY, useValue: bookStore },
      { provide: READ_NOMINATIONS_REPOSITORY, useValue: nominationStore },
      { provide: OPEN_LIBRARY, useValue: { search: mock() } },
    ],
  }).compile();

  return module.get(ReadNominationsService);
}

test("nominating a new title adds it to the list with a reason", async () => {
  const bookStore = createBookStore();
  const nominationStore = createNominationStore();
  const service = await createService(bookStore, nominationStore);

  await expect(service.nominate(userId, hit)).resolves.toEqual(nomination);
  expect(bookStore.insert).toHaveBeenCalled();
  expect(nominationStore.insert).toHaveBeenCalledWith({
    bookId: book.id,
    userId,
    reason: hit.reason,
  });
  expect(bookStore.update).not.toHaveBeenCalled();
});

test("nominating a book already on the list does not create a second copy", async () => {
  const bookStore = createBookStore({
    findByOlibKey: mock(() => Promise.resolve(book)),
  });
  const nominationStore = createNominationStore();
  const service = await createService(bookStore, nominationStore);

  await service.nominate(userId, {
    ...hit,
    title: "Wrong title",
    author: "Someone else",
  });

  expect(bookStore.insert).not.toHaveBeenCalled();
  expect(bookStore.update).not.toHaveBeenCalled();
  expect(nominationStore.insert).toHaveBeenCalledWith({
    bookId: book.id,
    userId,
    reason: hit.reason,
  });
});

test("rejects a second open nomination for the same book", async () => {
  const bookStore = createBookStore({
    findById: mock(() => Promise.resolve(book)),
  });
  const nominationStore = createNominationStore({
    findOpenByBookId: mock(() =>
      Promise.resolve({
        id: nomination.id,
        bookId: book.id,
        userId,
        reason: nomination.reason,
        nominatorName: "Ada",
      }),
    ),
  });
  const service = await createService(bookStore, nominationStore);

  await expect(
    service.nominate(userId, { bookId: book.id, reason: "Again" }),
  ).rejects.toBeInstanceOf(ConflictException);
  expect(nominationStore.insert).not.toHaveBeenCalled();
  expect(bookStore.insert).not.toHaveBeenCalled();
});

test("refuses a new title when Open Library has no page count", async () => {
  const bookStore = createBookStore();
  const service = await createService(bookStore, createNominationStore());

  await expect(
    service.nominate(userId, { ...hit, pageCount: undefined }),
  ).rejects.toBeInstanceOf(BadRequestException);
  expect(bookStore.insert).not.toHaveBeenCalled();
});

test("parking a nomination keeps the book", async () => {
  const bookStore = createBookStore();
  const nominationStore = createNominationStore();
  const service = await createService(bookStore, nominationStore);

  await expect(
    service.setStatus(nomination.id, "parked"),
  ).resolves.toMatchObject({ status: "parked" });
  expect(nominationStore.updateStatus).toHaveBeenCalledWith(
    nomination.id,
    "parked",
  );
  expect(bookStore.update).not.toHaveBeenCalled();
});

test("rejecting a nomination keeps the book", async () => {
  const bookStore = createBookStore();
  const nominationStore = createNominationStore({
    updateStatus: mock(() =>
      Promise.resolve({ ...nomination, status: "rejected" as const }),
    ),
  });
  const service = await createService(bookStore, nominationStore);

  await expect(
    service.setStatus(nomination.id, "rejected"),
  ).resolves.toMatchObject({ status: "rejected" });
  expect(bookStore.update).not.toHaveBeenCalled();
});

test("does not close a nomination twice", async () => {
  const service = await createService(
    createBookStore(),
    createNominationStore({
      findById: mock(() =>
        Promise.resolve({ ...nomination, status: "parked" as const }),
      ),
    }),
  );

  await expect(
    service.setStatus(nomination.id, "rejected"),
  ).rejects.toBeInstanceOf(ConflictException);
});

test("throws when the nomination is missing", async () => {
  const service = await createService(
    createBookStore(),
    createNominationStore({
      findById: mock(() => Promise.resolve(null)),
    }),
  );

  await expect(
    service.setStatus(nomination.id, "parked"),
  ).rejects.toBeInstanceOf(NotFoundException);
});
