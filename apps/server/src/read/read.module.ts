import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { ReadMembersController } from "./members.controller";
import { ReadMembersRepository } from "./members.repository";
import { ReadMembersService } from "./members.service";
import { READ_MEMBERS_REPOSITORY } from "./read.constants";

@Module({
  imports: [UsersModule],
  controllers: [ReadMembersController],
  providers: [
    ReadMembersService,
    ReadMembersRepository,
    { provide: READ_MEMBERS_REPOSITORY, useExisting: ReadMembersRepository },
  ],
})
export class ReadModule {}
