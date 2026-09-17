import { expect, test } from "bun:test";
import { parseReadJson } from "./read-api";

test("treats a missing session as empty", () => {
  expect(parseReadJson(404, "")).toBeNull();
  expect(parseReadJson(204, "")).toBeNull();
  expect(parseReadJson(200, "")).toBeNull();
});

test("parses a session payload", () => {
  expect(
    parseReadJson<{ session: { id: string } }>(200, '{"session":{"id":"1"}}'),
  ).toEqual({
    session: { id: "1" },
  });
});

test("throws on a failed request", () => {
  expect(() => parseReadJson(500, "nope")).toThrow("Failed to load");
  expect(() =>
    parseReadJson(409, JSON.stringify({ message: "No active session" })),
  ).toThrow("No active session");
});
