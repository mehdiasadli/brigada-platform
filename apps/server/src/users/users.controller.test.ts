import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { Test } from "@nestjs/testing";
import { AdminGuard } from "./admin.guard";
import { SESSION_READER } from "./users.constants";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

function createModule(users: {
  list: ReturnType<typeof mock>;
  getById: ReturnType<typeof mock>;
}) {
  return Test.createTestingModule({
    controllers: [UsersController],
    providers: [
      { provide: UsersService, useValue: users },
      AdminGuard,
      { provide: SESSION_READER, useValue: { getSession: mock() } },
    ],
  }).compile();
}

test("forwards a parsed list query to the users service", async () => {
  const list = mock(() =>
    Promise.resolve({ items: [], page: 1, limit: 20, total: 0, totalPages: 1 }),
  );
  const module = await createModule({ list, getById: mock() });

  await module.get(UsersController).list({ page: "1", limit: "20" });

  expect(list).toHaveBeenCalledWith({
    page: 1,
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });
});

test("forwards a user id to the users service", async () => {
  const getById = mock(() =>
    Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }),
  );
  const module = await createModule({ list: mock(), getById });

  await module
    .get(UsersController)
    .getById("11111111-1111-4111-8111-111111111111");

  expect(getById).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111");
});
