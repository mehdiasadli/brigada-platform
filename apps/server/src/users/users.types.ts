import type { ROLE_VALUES } from "@brigada/db/schema";
import type { AdminUserListQuery } from "./users.query";

export type AdminUserRole = (typeof ROLE_VALUES)[number];

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string;
  role: AdminUserRole;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminUserList = {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UsersStore = {
  list(
    query: AdminUserListQuery,
  ): Promise<{ items: AdminUser[]; total: number }>;
  findById(id: string): Promise<AdminUser | null>;
};

export type SessionUser = {
  role?: string | null;
};

export type SessionReader = {
  getSession(cookie: string | undefined): Promise<{ user: SessionUser } | null>;
};
