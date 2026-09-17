import { expect, test } from "bun:test";
import { isAllowedRefUrl, resolveRefUrl } from "./ref-url";

test("accepts the main site and first-party apps, including inner paths", () => {
  expect(isAllowedRefUrl("http://localhost:3501")).toBe(true);
  expect(isAllowedRefUrl("http://localhost:3501/feed")).toBe(true);
  expect(isAllowedRefUrl("http://localhost:3502")).toBe(true);
  expect(isAllowedRefUrl("http://localhost:3502/users")).toBe(true);
  expect(isAllowedRefUrl("https://www.brigada.com/insider")).toBe(true);
  expect(isAllowedRefUrl("https://admin.brigada.com/users")).toBe(true);
  expect(isAllowedRefUrl("https://read.brigada.com/post/1")).toBe(true);
});

test("rejects missing, foreign, or non-http urls", () => {
  expect(isAllowedRefUrl(null)).toBe(false);
  expect(isAllowedRefUrl("")).toBe(false);
  expect(isAllowedRefUrl("https://evil.example")).toBe(false);
  expect(isAllowedRefUrl("http://localhost:3500")).toBe(false);
  expect(isAllowedRefUrl("javascript:alert(1)")).toBe(false);
});

test("falls back to the main website", () => {
  expect(resolveRefUrl(null)).toBe("http://localhost:3501");
  expect(resolveRefUrl("https://evil.example")).toBe("http://localhost:3501");
  expect(resolveRefUrl("https://www.brigada.com/insider")).toBe(
    "https://www.brigada.com/insider",
  );
});
