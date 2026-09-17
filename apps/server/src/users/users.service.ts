import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USERS_REPOSITORY } from "./users.constants";
import type { AdminUserListQuery } from "./users.query";
import type { AdminUserList, UsersStore } from "./users.types";

@Injectable()
export class UsersService {
  constructor(@Inject(USERS_REPOSITORY) private readonly users: UsersStore) {}

  async list(query: AdminUserListQuery): Promise<AdminUserList> {
    const { items, total } = await this.users.list(query);
    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    };
  }

  async getById(id: string) {
    const found = await this.users.findById(id);
    if (!found) {
      throw new NotFoundException("User not found");
    }

    return found;
  }
}
