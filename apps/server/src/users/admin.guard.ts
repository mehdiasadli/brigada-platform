import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SESSION_READER } from "./users.constants";
import type { SessionReader } from "./users.types";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(SESSION_READER) private readonly sessionReader: SessionReader,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = await this.sessionReader.getSession(request.headers.cookie);

    if (!session) {
      throw new UnauthorizedException();
    }

    if (session.user.role !== "admin") {
      throw new ForbiddenException();
    }

    return true;
  }
}
