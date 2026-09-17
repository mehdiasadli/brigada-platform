import "reflect-metadata";
import { expect, test } from "bun:test";
import type { ExecutionContext } from "@nestjs/common";
import { DiscordGuildLock } from "./discord-guild-lock";
import { GuildLockGuard } from "./guild-lock.guard";

const allowedGuildId = "123456789012345678";

function createContext(guildId: string | null): ExecutionContext {
  return {
    getType: () => "necord",
    getArgs: () => [[{ guildId }]],
    getClass: () => class {},
    getHandler: () => {
      return;
    },
  } as ExecutionContext;
}

test("allows slash commands from the configured guild", () => {
  const guard = new GuildLockGuard(new DiscordGuildLock(allowedGuildId));

  expect(guard.canActivate(createContext(allowedGuildId))).toBe(true);
});

test("rejects slash commands from other guilds and DMs", () => {
  const guard = new GuildLockGuard(new DiscordGuildLock(allowedGuildId));

  expect(guard.canActivate(createContext("999456789012345678"))).toBe(false);
  expect(guard.canActivate(createContext(null))).toBe(false);
});
