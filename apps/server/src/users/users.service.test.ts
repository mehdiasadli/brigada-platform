import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { USERS_REPOSITORY } from "./users.constants";
import { UsersService } from "./users.service";
import type { AdminUser } from "./users.types";

const user: AdminUser = {
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
};

test("returns paginated users", async () => {
  const list = mock(() => Promise.resolve({ items: [user], total: 21 }));
  const module = await Test.createTestingModule({
    providers: [
      UsersService,
      { provide: USERS_REPOSITORY, useValue: { list, findById: mock() } },
    ],
  }).compile();

  await expect(
    module.get(UsersService).list({
      page: 1,
      limit: 20,
      sort: "createdAt",
      order: "desc",
    }),
  ).resolves.toEqual({
    items: [user],
    page: 1,
    limit: 20,
    total: 21,
    totalPages: 2,
  });
});

test("throws when a user is missing", async () => {
  const findById = mock(() => Promise.resolve(null));
  const module = await Test.createTestingModule({
    providers: [
      UsersService,
      { provide: USERS_REPOSITORY, useValue: { list: mock(), findById } },
    ],
  }).compile();

  await expect(
    module.get(UsersService).getById(user.id),
  ).rejects.toBeInstanceOf(NotFoundException);
});
