import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { SESSION_READER } from "../users/users.constants";
import type { SessionReader } from "../users/users.types";
import type { ReadMembersStore } from "./members.types";
import { READ_MEMBERS_REPOSITORY } from "./read.constants";

@Injectable()
export class ReadMemberGuard implements CanActivate {
  constructor(
    @Inject(SESSION_READER) private readonly sessionReader: SessionReader,
    @Inject(READ_MEMBERS_REPOSITORY)
    private readonly members: ReadMembersStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { userId?: string }>();
    const session = await this.sessionReader.getSession(request.headers.cookie);

    if (!session?.user.id) {
      throw new UnauthorizedException();
    }

    if (!(await this.members.findByUserId(session.user.id))) {
      throw new ForbiddenException();
    }

    request.userId = session.user.id;
    return true;
  }
}
