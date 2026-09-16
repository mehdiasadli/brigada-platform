import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AUTH_REPOSITORY } from "./auth-handler";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    { provide: AUTH_REPOSITORY, useExisting: AuthRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
