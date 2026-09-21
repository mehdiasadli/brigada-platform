import { expect, test } from "bun:test";
import { parsePercentage, readPercentageInput } from "./progress-input";

test("reads a percentage typed into the command", () => {
  expect(
    readPercentageInput(undefined, [{ name: "percentage", value: "55" }]),
  ).toBe("55");
  expect(
    readPercentageInput(undefined, [{ name: "percentage", value: 55 }]),
  ).toBe("55");
  expect(readPercentageInput("55%", [])).toBe("55%");
});

test("accepts a whole number from 0 to 100", () => {
  expect(parsePercentage("12")).toEqual({ percentage: 12 });
  expect(parsePercentage("0")).toEqual({ percentage: 0 });
  expect(parsePercentage("100%")).toEqual({ percentage: 100 });
});

test("rejects a missing or partial percentage", () => {
  expect(parsePercentage(null)).toEqual({
    error: "Enter a percentage from 0 to 100, for example 55.",
  });
  expect(parsePercentage("")).toEqual({
    error: "Enter a percentage from 0 to 100, for example 55.",
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
