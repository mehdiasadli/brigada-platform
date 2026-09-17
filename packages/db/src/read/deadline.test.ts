import { expect, test } from "bun:test";
import { calculateReadingDeadline } from "./deadline";

function utcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

test("throws when page count is not positive", () => {
  expect(() => calculateReadingDeadline(0, utcDate(2026, 9, 14))).toThrow(
    "Page count",
  );
});

test("a 16-page book starting Monday finishes that Monday", () => {
  // 16 * 1.25 = 20 weekday pages
  expect(calculateReadingDeadline(16, utcDate(2026, 9, 14))).toEqual(
    utcDate(2026, 9, 14),
  );
});

test("a 20-page book starting Monday spills into Tuesday", () => {
  // 20 * 1.25 = 25 → Mon 20 + Tue 5
  expect(calculateReadingDeadline(20, utcDate(2026, 9, 14))).toEqual(
    utcDate(2026, 9, 15),
  );
});

test("uses weekend capacity on Saturday", () => {
  // 20 * 1.25 = 25 weekend pages
  expect(calculateReadingDeadline(20, utcDate(2026, 9, 19))).toEqual(
    utcDate(2026, 9, 19),
  );
});

test("walks across a weekend", () => {
  // 80 * 1.25 = 100
  // Fri 18: 20 → 80; Sat 19: 25 → 55; Sun 20: 25 → 30; Mon 21: 20 → 10; Tue 22: 20
  expect(calculateReadingDeadline(80, utcDate(2026, 9, 18))).toEqual(
    utcDate(2026, 9, 22),
  );
});

test("uses the UTC calendar day of a timestamp start", () => {
  expect(
    calculateReadingDeadline(16, new Date("2026-09-14T22:15:00.000Z")),
  ).toEqual(utcDate(2026, 9, 14));
});
