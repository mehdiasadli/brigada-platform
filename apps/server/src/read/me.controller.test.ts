import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { SESSION_READER } from "../users/users.constants";
import { ReadMeController } from "./me.controller";
import { ReadNominationsService } from "./nominations.service";
import { READ_MEMBERS_REPOSITORY } from "./read.constants";
import { ReadMemberGuard } from "./read-member.guard";
import { ReadSessionsService } from "./sessions.service";

const userId = "11111111-1111-4111-8111-111111111111";

test("returns 404 when there is no open session", async () => {
  const currentForMember = mock(() => Promise.resolve(null));
  const module = await Test.createTestingModule({
    controllers: [ReadMeController],
    providers: [
      { provide: ReadSessionsService, useValue: { currentForMember } },
      { provide: ReadNominationsService, useValue: {} },
      ReadMemberGuard,
      { provide: SESSION_READER, useValue: { getSession: mock() } },
      { provide: READ_MEMBERS_REPOSITORY, useValue: { findByUserId: mock() } },
    ],
  }).compile();

  await expect(
    module.get(ReadMeController).current({ userId }),
  ).rejects.toBeInstanceOf(NotFoundException);
});
