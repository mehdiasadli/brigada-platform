import { expect, test } from "bun:test";
import { BadRequestException } from "@nestjs/common";
import { encodeCatalogCursor } from "./books.catalog";
import {
  parseCatalogQuery,
  parseCreateReadBook,
  parseSearchBooksQuery,
} from "./books.query";

test("requires title author pages and year", () => {
  expect(() =>
    parseCreateReadBook({
      olibKey: "/works/OL1W",
      title: "Dune",
    }),
  ).toThrow(BadRequestException);

  expect(
    parseCreateReadBook({
      olibKey: "/works/OL1W",
      title: "Dune",
      author: "Frank Herbert",
      pageCount: 412,
      firstPublishYear: 1965,
    }),
  ).toMatchObject({ title: "Dune", pageCount: 412 });
});

test("requires a search query", () => {
  expect(() => parseSearchBooksQuery({})).toThrow(BadRequestException);
  expect(parseSearchBooksQuery({ q: "dune" })).toEqual({ q: "dune" });
});

test("parses a catalog query with defaults and a cursor", () => {
  const cursor = encodeCatalogCursor({
    value: "1965",
    id: "11111111-1111-4111-8111-111111111111",
  });

  expect(
    parseCatalogQuery({
      q: "dune",
      status: "completed",
      minYear: "1960",
      maxPages: "500",
      sort: "firstPublishYear",
      order: "asc",
      cursor,
    }),
  ).toMatchObject({
    q: "dune",
    status: "completed",
    minYear: 1960,
    maxPages: 500,
    sort: "firstPublishYear",
    order: "asc",
    limit: 20,
    cursor: {
      value: "1965",
      id: "11111111-1111-4111-8111-111111111111",
    },
  });
});

test("rejects a broken catalog cursor", () => {
  expect(() => parseCatalogQuery({ cursor: "nope" })).toThrow(
    BadRequestException,
  );
});
