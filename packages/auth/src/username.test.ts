import { expect, test } from "bun:test";
import { isBrigadaUsername } from "./username";

test("accepts lowercase handles that start with a letter", () => {
  expect(isBrigadaUsername("abc")).toBe(true);
  expect(isBrigadaUsername("user_1")).toBe(true);
  expect(isBrigadaUsername("a1b2c3")).toBe(true);
  expect(isBrigadaUsername("ab")).toBe(false);
});

test("rejects leading digits, trailing or doubled underscores, and non-ascii", () => {
  expect(isBrigadaUsername("1abc")).toBe(false);
  expect(isBrigadaUsername("_abc")).toBe(false);
  expect(isBrigadaUsername("abc_")).toBe(false);
  expect(isBrigadaUsername("ab__c")).toBe(false);
  expect(isBrigadaUsername("Abc")).toBe(false);
  expect(isBrigadaUsername("ab-c")).toBe(false);
  expect(isBrigadaUsername("ab.c")).toBe(false);
});
