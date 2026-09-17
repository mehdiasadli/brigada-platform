import { expect, test } from "bun:test";
import { shouldPostMidterm } from "./midterm";

const start = new Date("2026-09-14T00:00:00.000Z");
const deadline = new Date("2026-09-24T00:00:00.000Z");

test("waits until the midpoint", () => {
  expect(
    shouldPostMidterm(
      start,
      deadline,
      new Date("2026-09-18T00:00:00.000Z"),
      null,
    ),
  ).toBe(false);
  expect(
    shouldPostMidterm(
      start,
      deadline,
      new Date("2026-09-19T00:00:00.000Z"),
      null,
    ),
  ).toBe(true);
});

test("does not post twice", () => {
  expect(
    shouldPostMidterm(
      start,
      deadline,
      new Date("2026-09-22T00:00:00.000Z"),
      new Date("2026-09-19T00:00:00.000Z"),
    ),
  ).toBe(false);
});
