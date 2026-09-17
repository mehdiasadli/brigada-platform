import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../users/admin.guard";
import { parseGrantReadMember, parseReadMemberUserId } from "./members.query";
import { ReadMembersService } from "./members.service";

@Controller("api/admin/read/members")
@UseGuards(AdminGuard)
export class ReadMembersController {
  constructor(
    @Inject(ReadMembersService) private readonly members: ReadMembersService,
  ) {}

  @Get()
  list() {
    return this.members.list();
  }

  @Post()
  grant(@Body() body: unknown) {
    return this.members.grant(parseGrantReadMember(body).userId);
  }

  @Delete(":userId")
  @HttpCode(204)
  revoke(@Param("userId") userId: string) {
    return this.members.revoke(parseReadMemberUserId(userId));
  }
}
