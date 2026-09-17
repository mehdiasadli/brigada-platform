import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ReadMembersService } from "./members.service";
import type { ReadMember } from "./members.types";
import { READ_MEMBERS_REPOSITORY } from "./read.constants";

const member: ReadMember = {
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Ada",
    email: "ada@brigada.com",
    emailVerified: true,
    image: null,
    username: "ada",
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    twoFactorEnabled: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-02"),
  },
  createdAt: new Date("2026-09-01"),
};

function createStore(overrides: Record<string, ReturnType<typeof mock>> = {}) {
  return {
    list: mock(() => Promise.resolve([member])),
    findByUserId: mock(() => Promise.resolve(null)),
    userExists: mock(() => Promise.resolve(true)),
    insert: mock(() => Promise.resolve(member)),
    delete: mock(() => Promise.resolve(true)),
    ...overrides,
  };
}

async function createService(store: ReturnType<typeof createStore>) {
  const module = await Test.createTestingModule({
    providers: [
      ReadMembersService,
      { provide: READ_MEMBERS_REPOSITORY, useValue: store },
    ],
  }).compile();

  return module.get(ReadMembersService);
}

test("lists members", async () => {
  const store = createStore();
  const service = await createService(store);

  await expect(service.list()).resolves.toEqual([member]);
});

test("lists a public member directory without emails", async () => {
  const service = await createService(createStore());

  await expect(service.listDirectory()).resolves.toEqual([
    {
      name: "Ada",
      username: "ada",
      image: null,
      memberSince: member.createdAt,
    },
  ]);
});

test("grants membership to an existing user", async () => {
  const store = createStore();
  const service = await createService(store);

  await expect(service.grant(member.user.id)).resolves.toEqual(member);
  expect(store.insert).toHaveBeenCalledWith(member.user.id);
});

test("rejects a missing user", async () => {
  const service = await createService(
    createStore({ userExists: mock(() => Promise.resolve(false)) }),
  );

  await expect(service.grant(member.user.id)).rejects.toBeInstanceOf(
    NotFoundException,
  );
});

test("rejects a duplicate member", async () => {
  const service = await createService(
    createStore({ findByUserId: mock(() => Promise.resolve(member)) }),
  );

  await expect(service.grant(member.user.id)).rejects.toBeInstanceOf(
    ConflictException,
  );
});

test("revokes a member", async () => {
  const store = createStore();
  const service = await createService(store);

  await service.revoke(member.user.id);
  expect(store.delete).toHaveBeenCalledWith(member.user.id);
});

test("throws when revoking a missing member", async () => {
  const service = await createService(
    createStore({ delete: mock(() => Promise.resolve(false)) }),
  );

  await expect(service.revoke(member.user.id)).rejects.toBeInstanceOf(
    NotFoundException,
  );
});
