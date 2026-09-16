import { Inject, Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import { AUTH_REPOSITORY, type AuthHandler } from "./auth-handler";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthHandler,
  ) {}

  handle(request: Request, response: Response) {
    return this.authRepository.handle(request, response);
  }
}
