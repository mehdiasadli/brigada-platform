import { expect, test } from "bun:test";
import { slugifyTitle, uniquifySlug } from "./slug";

test("slugifies a title", () => {
  expect(slugifyTitle("The Hobbit!")).toBe("the-hobbit");
});

test("falls back when the title has no letters", () => {
  expect(slugifyTitle("!!!")).toBe("book");
});

test("appends a suffix when the slug is taken", () => {
  expect(uniquifySlug("the-hobbit", new Set(["the-hobbit"]))).toBe(
    "the-hobbit-2",
  );
});
