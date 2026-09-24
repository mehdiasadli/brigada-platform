import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ReadBooksService } from "./books.service";
import type { ReadBook } from "./books.types";
import {
  OPEN_LIBRARY,
  READ_BOOKS_REPOSITORY,
  READ_NOMINATIONS_REPOSITORY,
  READ_SESSIONS_REPOSITORY,
} from "./read.constants";

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

const input = {
  olibKey: book.olibKey,
  title: book.title,
  author: book.author,
  pageCount: book.pageCount,
  firstPublishYear: book.firstPublishYear,
};

function createStore(overrides: Record<string, ReturnType<typeof mock>> = {}) {
  return {
    list: mock(() => Promise.resolve([book])),
    listVisible: mock(() => Promise.resolve([book])),
    listCatalog: mock(() =>
      Promise.resolve({ items: [book], nextCursor: null }),
    ),
    findById: mock(() => Promise.resolve(book)),
    findBySlug: mock(() => Promise.resolve(book)),
    findByOlibKey: mock(() => Promise.resolve(null)),
    listSlugs: mock(() => Promise.resolve(["other"])),
    insert: mock(() => Promise.resolve(book)),
    update: mock(() => Promise.resolve(book)),
    listReviews: mock(() => Promise.resolve([])),
    findReview: mock(() => Promise.resolve(null)),
    hasCompletedBook: mock(() => Promise.resolve(false)),
    findProgressForBook: mock(() => Promise.resolve(null)),
    ...overrides,
  };
}

async function createService(
  store: ReturnType<typeof createStore>,
  search: ReturnType<typeof mock> = mock(() => Promise.resolve([])),
  isOnOpenSlate: ReturnType<typeof mock> = mock(() => Promise.resolve(false)),
) {
  const module = await Test.createTestingModule({
    providers: [
      ReadBooksService,
      { provide: READ_BOOKS_REPOSITORY, useValue: store },
      { provide: OPEN_LIBRARY, useValue: { search } },
      {
        provide: READ_NOMINATIONS_REPOSITORY,
        useValue: {
          findOpenByBookId: mock(() => Promise.resolve(null)),
        },
      },
      {
        provide: READ_SESSIONS_REPOSITORY,
        useValue: { isOnOpenSlate },
      },
    ],
  }).compile();

  return module.get(ReadBooksService);
}

test("creates a book with a unique slug", async () => {
  const store = createStore();
  const service = await createService(store);

  await expect(service.create(input)).resolves.toEqual(book);
  expect(store.insert).toHaveBeenCalledWith({ ...input, slug: "the-hobbit" });
});

test("rejects a duplicate OpenLibrary key", async () => {
  const service = await createService(
    createStore({ findByOlibKey: mock(() => Promise.resolve(book)) }),
  );

  await expect(service.create(input)).rejects.toBeInstanceOf(ConflictException);
});

test("throws when a book is missing", async () => {
  const service = await createService(
    createStore({ findById: mock(() => Promise.resolve(null)) }),
  );

  await expect(service.getById(book.id)).rejects.toBeInstanceOf(
    NotFoundException,
  );
});

test("keeps the slug when the title changes", async () => {
  const store = createStore();
  const service = await createService(store);

  await service.update(book.id, { title: "Dune" });
  expect(store.update).toHaveBeenCalledWith(book.id, { title: "Dune" });
});

test("refuses a nomination for a book already on the open slate", async () => {
  const service = await createService(
    createStore(),
    mock(() => Promise.resolve([])),
    mock(() => Promise.resolve(true)),
  );

  await expect(service.getBySlug(book.slug, book.id)).resolves.toMatchObject({
    viewer: { canNominate: false },
  });
});

test("refuses a nomination for a book the club already read", async () => {
  const service = await createService(
    createStore({
      findBySlug: mock(() =>
        Promise.resolve({ ...book, status: "completed" as const }),
      ),
    }),
  );

  await expect(service.getBySlug(book.slug, book.id)).resolves.toMatchObject({
    viewer: { canNominate: false },
  });
});

test("lets a member review a club book they have not reviewed", async () => {
  const store = createStore({
    findBySlug: mock(() =>
      Promise.resolve({ ...book, status: "reading" as const }),
    ),
  });
  const service = await createService(store);

  await expect(service.getBySlug(book.slug, book.id)).resolves.toMatchObject({
    viewer: { canReview: true, review: null },
  });
});

test("keeps reviews closed until the club starts the book", async () => {
  const service = await createService(createStore());

  await expect(service.getBySlug(book.slug, book.id)).resolves.toMatchObject({
    viewer: { canReview: false, review: null },
  });
});

test("hides a removed book from members", async () => {
  const service = await createService(
    createStore({
      findBySlug: mock(() => Promise.resolve({ ...book, status: "removed" })),
    }),
  );

  await expect(service.getBySlug(book.slug, book.id)).rejects.toBeInstanceOf(
    NotFoundException,
  );
});

test("forwards OpenLibrary search", async () => {
  const hits = [
    {
      olibKey: "/works/OL1W",
      title: "Dune",
      author: "Frank Herbert",
      pageCount: 412,
      firstPublishYear: 1965,
      subtitle: null,
      coverId: null,
    },
  ];
  const search = mock(() => Promise.resolve(hits));
  const service = await createService(createStore(), search);

  await expect(service.search("dune")).resolves.toEqual(hits);
});
