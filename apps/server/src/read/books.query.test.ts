import { expect, test } from "bun:test";
import { BadRequestException } from "@nestjs/common";
import { parseCreateReadBook, parseSearchBooksQuery } from "./books.query";

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
