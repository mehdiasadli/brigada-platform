import { expect, test } from "bun:test";
import { DiscordGuildLock } from "./discord-guild-lock";

const allowedGuildId = "123456789012345678";

test("allows the configured guild", () => {
  const lock = new DiscordGuildLock(allowedGuildId);

  expect(lock.allows(allowedGuildId)).toBe(true);
});

test("rejects any other guild or a missing id", () => {
  const lock = new DiscordGuildLock(allowedGuildId);

  expect(lock.allows("999456789012345678")).toBe(false);
  expect(lock.allows(null)).toBe(false);
  expect(lock.allows(undefined)).toBe(false);
});
