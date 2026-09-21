import { expect, test } from "bun:test";
import { parsePercentage } from "./progress-input";

test("accepts a whole number from 0 to 100", () => {
  expect(parsePercentage("12")).toEqual({ percentage: 12 });
  expect(parsePercentage("0")).toEqual({ percentage: 0 });
  expect(parsePercentage("100%")).toEqual({ percentage: 100 });
});

test("rejects a missing or partial percentage", () => {
  expect(parsePercentage(null)).toEqual({
    error: "Add a percentage from 0 to 100.",
  });
  expect(parsePercentage("")).toEqual({
    error: "Add a percentage from 0 to 100.",
  });
  expect(parsePercentage("12.5")).toEqual({
    error: "Use a whole number from 0 to 100.",
  });
  expect(parsePercentage("150")).toEqual({
    error: "Use a whole number from 0 to 100.",
  });
  expect(parsePercentage("abc")).toEqual({
    error: "Use a whole number from 0 to 100.",
  });
});
