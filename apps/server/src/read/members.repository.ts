import { db } from "@brigada/db";
import { readBook, readMember, readReview, user } from "@brigada/db/schema";
import { Injectable } from "@nestjs/common";
import { desc, eq, type SQL } from "drizzle-orm";
import type { AdminUser } from "../users/users.types";
import type { ReadMember, ReadMembersStore } from "./members.types";

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

function toMember(
  row: { user: AdminUser; createdAt: Date } | undefined,
): ReadMember | null {
  if (!row) {
    return null;
  }

  return {
    user: row.user,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class ReadMembersRepository implements ReadMembersStore {
  async list() {
    const rows = await db
      .select({
        user: adminUserColumns,
        createdAt: readMember.createdAt,
      })
      .from(readMember)
      .innerJoin(user, eq(user.id, readMember.userId))
      .orderBy(readMember.createdAt);

    return rows.map((row) => toMember(row)).filter((row) => row !== null);
  }

  async findByUserId(userId: string) {
    return this.findMember(eq(readMember.userId, userId));
  }

  private async findByUsername(username: string) {
    return this.findMember(eq(user.username, username));
  }

  private async findMember(where: SQL) {
    const [row] = await db
      .select({
        user: adminUserColumns,
        createdAt: readMember.createdAt,
      })
      .from(readMember)
      .innerJoin(user, eq(user.id, readMember.userId))
      .where(where)
      .limit(1);

    return toMember(row);
  }

  async findProfileByUsername(username: string) {
    const member = await this.findByUsername(username);
    if (!member) {
      return null;
    }

    const reviews = await db
      .select({
        id: readReview.id,
        bookId: readReview.bookId,
        bookTitle: readBook.title,
        bookSlug: readBook.slug,
        rating: readReview.rating,
        body: readReview.body,
        createdAt: readReview.createdAt,
      })
      .from(readReview)
      .innerJoin(readBook, eq(readBook.id, readReview.bookId))
      .where(eq(readReview.userId, member.user.id))
      .orderBy(desc(readReview.createdAt));

    return {
      user: member.user,
      memberSince: member.createdAt,
      reviews,
    };
  }

  async userExists(userId: string) {
    const [row] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return Boolean(row);
  }

  async insert(userId: string) {
    await db.insert(readMember).values({ userId });
    const created = await this.findByUserId(userId);
    if (!created) {
      throw new Error("Failed to load created Read member");
    }

    return created;
  }

  async delete(userId: string) {
    const deleted = await db
      .delete(readMember)
      .where(eq(readMember.userId, userId))
      .returning({ userId: readMember.userId });

    return deleted.length > 0;
  }
}
