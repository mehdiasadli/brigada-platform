import { expect, test } from "bun:test";
import { parseApiErrorMessage } from "./api-error";

test("reads Nest's message field", () => {
  expect(
    parseApiErrorMessage(
      JSON.stringify({
        statusCode: 400,
        message: "Slate must be 2–10 unique books",
      }),
      "Request failed",
    ),
  ).toBe("Slate must be 2–10 unique books");
});

test("joins validation arrays", () => {
  expect(
    parseApiErrorMessage(
      JSON.stringify({ message: ["title is required", "pages is required"] }),
      "Request failed",
    ),
  ).toBe("title is required pages is required");
});

test("falls back on empty or invalid bodies", () => {
  expect(parseApiErrorMessage("", "Request failed")).toBe("Request failed");
  expect(parseApiErrorMessage("<html>", "Request failed")).toBe(
    "Request failed",
  );
});
