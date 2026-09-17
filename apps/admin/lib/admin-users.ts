import { headers } from "next/headers";
import { env } from "../env";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string;
  role: "user" | "moderator" | "admin";
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserList = {
  items: AdminUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUserListQuery = {
  page?: number;
  limit?: number;
  sort?: "createdAt" | "username" | "name";
  order?: "asc" | "desc";
};

async function adminFetch(path: string): Promise<Response> {
  const cookie = (await headers()).get("cookie");

  return fetch(`${env.NEXT_PUBLIC_BETTER_AUTH_URL}${path}`, {
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });
}

export async function listAdminUsers(
  query: AdminUserListQuery = {},
): Promise<AdminUserList> {
  const params = new URLSearchParams();
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.limit) {
    params.set("limit", String(query.limit));
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }
  if (query.order) {
    params.set("order", query.order);
  }

  const search = params.toString();
  const response = await adminFetch(
    `/api/admin/users${search ? `?${search}` : ""}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return (await response.json()) as AdminUserList;
}
