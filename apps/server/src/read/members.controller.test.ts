import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { Test } from "@nestjs/testing";
import { AdminGuard } from "../users/admin.guard";
import { SESSION_READER } from "../users/users.constants";
import { ReadMembersController } from "./members.controller";
import { ReadMembersService } from "./members.service";

const userId = "11111111-1111-4111-8111-111111111111";

function createModule(members: {
  list: ReturnType<typeof mock>;
  grant: ReturnType<typeof mock>;
  revoke: ReturnType<typeof mock>;
}) {
  return Test.createTestingModule({
    controllers: [ReadMembersController],
    providers: [
      { provide: ReadMembersService, useValue: members },
      AdminGuard,
      { provide: SESSION_READER, useValue: { getSession: mock() } },
    ],
  }).compile();
}

test("lists members", async () => {
  const list = mock(() => Promise.resolve([]));
  const module = await createModule({ list, grant: mock(), revoke: mock() });

  await module.get(ReadMembersController).list();
  expect(list).toHaveBeenCalledTimes(1);
});

test("grants a parsed user id", async () => {
  const grant = mock(() => Promise.resolve({ userId }));
  const module = await createModule({ list: mock(), grant, revoke: mock() });

  await module.get(ReadMembersController).grant({ userId });
  expect(grant).toHaveBeenCalledWith(userId);
});

test("revokes a parsed user id", async () => {
  const revoke = mock(() => Promise.resolve());
  const module = await createModule({ list: mock(), grant: mock(), revoke });

  await module.get(ReadMembersController).revoke(userId);
  expect(revoke).toHaveBeenCalledWith(userId);
});
