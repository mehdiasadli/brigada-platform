import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ReadBooksController } from "./books.controller";
import { ReadBooksRepository } from "./books.repository";
import { ReadBooksService } from "./books.service";
import { ReadMembersController } from "./members.controller";
import { ReadMembersRepository } from "./members.repository";
import { ReadMembersService } from "./members.service";
import { OpenLibraryClient } from "./open-library";
import {
  OPEN_LIBRARY,
  READ_BOOKS_REPOSITORY,
  READ_MEMBERS_REPOSITORY,
} from "./read.constants";

@Module({
  imports: [UsersModule],
  controllers: [ReadMembersController, ReadBooksController],
  providers: [
    ReadMembersService,
    ReadMembersRepository,
    { provide: READ_MEMBERS_REPOSITORY, useExisting: ReadMembersRepository },
    ReadBooksService,
    ReadBooksRepository,
    { provide: READ_BOOKS_REPOSITORY, useExisting: ReadBooksRepository },
    OpenLibraryClient,
    { provide: OPEN_LIBRARY, useExisting: OpenLibraryClient },
  ],
})
export class ReadModule {}
