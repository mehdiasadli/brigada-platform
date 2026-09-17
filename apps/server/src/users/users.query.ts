import { z } from "@brigada/env";
import { BadRequestException } from "@nestjs/common";

export const ADMIN_USER_SORT_FIELDS = [
  "createdAt",
  "username",
  "name",
] as const;

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(ADMIN_USER_SORT_FIELDS).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

export function parseAdminUserListQuery(input: unknown): AdminUserListQuery {
  const parsed = adminUserListQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException("Invalid user list query");
  }

  return parsed.data;
}

export const adminUserIdSchema = z.uuid();

export function parseAdminUserId(id: string): string {
  const parsed = adminUserIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new BadRequestException("Invalid user id");
  }

  return parsed.data;
}
