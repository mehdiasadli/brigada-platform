import { Module } from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { BetterAuthSessionReader } from "./session.reader";
import { SESSION_READER, USERS_REPOSITORY } from "./users.constants";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AdminGuard,
    UsersRepository,
    { provide: USERS_REPOSITORY, useExisting: UsersRepository },
    BetterAuthSessionReader,
    { provide: SESSION_READER, useExisting: BetterAuthSessionReader },
  ],
  exports: [AdminGuard],
})
export class UsersModule {}
