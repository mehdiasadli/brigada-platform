import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { parseAdminUserId, parseAdminUserListQuery } from "./users.query";
import { UsersService } from "./users.service";

@Controller("api/admin/users")
@UseGuards(AdminGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get()
  list(@Query() query: Record<string, string | undefined>) {
    return this.users.list(parseAdminUserListQuery(query));
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.users.getById(parseAdminUserId(id));
  }
}
