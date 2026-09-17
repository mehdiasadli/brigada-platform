import { expect, test } from "bun:test";
import {
  catalogSortValue,
  decodeCatalogCursor,
  encodeCatalogCursor,
  escapeIlike,
} from "./books.catalog";

test("round-trips a catalog cursor", () => {
  const cursor = { value: "2026-01-02T00:00:00.000Z", id: "book-1" };
  expect(decodeCatalogCursor(encodeCatalogCursor(cursor))).toEqual(cursor);
});

test("rejects a broken catalog cursor", () => {
  expect(() => decodeCatalogCursor("not-a-cursor")).toThrow();
});

test("escapes ilike wildcards", () => {
  expect(escapeIlike("100%_win")).toBe("100\\%\\_win");
});

test("serializes the active sort field", () => {
  const book = {
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    firstPublishYear: 1965,
    pageCount: 412,
  };

  expect(catalogSortValue("createdAt", book)).toBe("2026-03-01T00:00:00.000Z");
  expect(catalogSortValue("firstPublishYear", book)).toBe("1965");
  expect(catalogSortValue("pageCount", book)).toBe("412");
});
