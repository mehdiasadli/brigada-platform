import { db } from "@brigada/db";
import { user } from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import { asc, count, desc, eq } from "drizzle-orm";
import type { AdminUserListQuery } from "./users.query";
import type { AdminUser, UsersStore } from "./users.types";

const adminUserColumns = {
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  image: user.image,
  username: user.username,
  role: user.role,
  banned: user.banned,
  banReason: user.banReason,
  banExpires: user.banExpires,
  twoFactorEnabled: user.twoFactorEnabled,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
} as const;

const sortColumns = {
  createdAt: user.createdAt,
  username: user.username,
  name: user.name,
} as const;

@Injectable()
export class UsersRepository implements UsersStore {
  async list(query: AdminUserListQuery) {
    const sortColumn = sortColumns[query.sort];
    const orderBy = query.order === "asc" ? asc(sortColumn) : desc(sortColumn);

    const [items, [totalRow]] = await Promise.all([
      db
        .select(adminUserColumns)
        .from(user)
        .orderBy(orderBy)
        .limit(query.limit)
        .offset((query.page - 1) * query.limit),
      db.select({ total: count() }).from(user),
    ]);

    return {
      items: items as AdminUser[],
      total: totalRow?.total ?? 0,
    };
  }

  async findById(id: string) {
    const [row] = await db
      .select(adminUserColumns)
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return (row as AdminUser | undefined) ?? null;
  }
}
