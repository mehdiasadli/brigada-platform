import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ReadBooksController } from "./books.controller";
import { ReadBooksRepository } from "./books.repository";
import { ReadBooksService } from "./books.service";
import { ReadMeController } from "./me.controller";
import { ReadMembersController } from "./members.controller";
import { ReadMembersRepository } from "./members.repository";
import { ReadMembersService } from "./members.service";
import { OpenLibraryClient } from "./open-library";
import {
  OPEN_LIBRARY,
  READ_BOOKS_REPOSITORY,
  READ_MEMBERS_REPOSITORY,
  READ_SESSIONS_REPOSITORY,
  VOTE_PUBLISHER,
} from "./read.constants";
import { ReadMemberGuard } from "./read-member.guard";
import { ReadSessionsController } from "./sessions.controller";
import { ReadSessionsRepository } from "./sessions.repository";
import { ReadSessionsService } from "./sessions.service";
import { NoopVotePublisher } from "./vote-publisher";

@Module({
  imports: [UsersModule],
  controllers: [
    ReadMembersController,
    ReadBooksController,
    ReadSessionsController,
    ReadMeController,
  ],
  providers: [
    ReadMembersService,
    ReadMembersRepository,
    { provide: READ_MEMBERS_REPOSITORY, useExisting: ReadMembersRepository },
    ReadBooksService,
    ReadBooksRepository,
    { provide: READ_BOOKS_REPOSITORY, useExisting: ReadBooksRepository },
    OpenLibraryClient,
    { provide: OPEN_LIBRARY, useExisting: OpenLibraryClient },
    ReadSessionsService,
    ReadSessionsRepository,
    { provide: READ_SESSIONS_REPOSITORY, useExisting: ReadSessionsRepository },
    NoopVotePublisher,
    { provide: VOTE_PUBLISHER, useExisting: NoopVotePublisher },
    ReadMemberGuard,
  ],
  exports: [ReadSessionsService, READ_MEMBERS_REPOSITORY],
})
export class ReadModule {}
