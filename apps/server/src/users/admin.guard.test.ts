import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import {
  type ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AdminGuard } from "./admin.guard";
import { SESSION_READER } from "./users.constants";

function createContext(cookie?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { cookie } }),
    }),
  } as ExecutionContext;
}

test("rejects a missing session", async () => {
  const getSession = mock(() => Promise.resolve(null));
  const module = await Test.createTestingModule({
    providers: [
      AdminGuard,
      { provide: SESSION_READER, useValue: { getSession } },
    ],
  }).compile();

  await expect(
    module.get(AdminGuard).canActivate(createContext()),
  ).rejects.toBeInstanceOf(UnauthorizedException);
});

test("rejects a non-admin session", async () => {
  const getSession = mock(() =>
    Promise.resolve({ user: { role: "moderator" } }),
  );
  const module = await Test.createTestingModule({
    providers: [
      AdminGuard,
      { provide: SESSION_READER, useValue: { getSession } },
    ],
  }).compile();

  await expect(
    module.get(AdminGuard).canActivate(createContext("session=1")),
  ).rejects.toBeInstanceOf(ForbiddenException);
});

test("allows an admin session", async () => {
  const getSession = mock(() => Promise.resolve({ user: { role: "admin" } }));
  const module = await Test.createTestingModule({
    providers: [
      AdminGuard,
      { provide: SESSION_READER, useValue: { getSession } },
    ],
  }).compile();

  await expect(
    module.get(AdminGuard).canActivate(createContext("session=1")),
  ).resolves.toBe(true);
});
