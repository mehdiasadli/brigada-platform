import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ReadBooksService } from "./books.service";
import type { ReadBook } from "./books.types";
import { OPEN_LIBRARY, READ_BOOKS_REPOSITORY } from "./read.constants";

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
    findById: mock(() => Promise.resolve(book)),
    findByOlibKey: mock(() => Promise.resolve(null)),
    listSlugs: mock(() => Promise.resolve(["other"])),
    insert: mock(() => Promise.resolve(book)),
    update: mock(() => Promise.resolve(book)),
    ...overrides,
  };
}

async function createService(
  store: ReturnType<typeof createStore>,
  search: ReturnType<typeof mock> = mock(() => Promise.resolve([])),
) {
  const module = await Test.createTestingModule({
    providers: [
      ReadBooksService,
      { provide: READ_BOOKS_REPOSITORY, useValue: store },
      { provide: OPEN_LIBRARY, useValue: { search } },
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
