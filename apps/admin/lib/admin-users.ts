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

export function adminUsersQueryKey(query: AdminUserListQuery = {}) {
  return ["admin-users", query] as const;
}

export function adminUserQueryKey(id: string) {
  return ["admin-user", id] as const;
}

export function adminUsersPath(query: AdminUserListQuery = {}): string {
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
  return `/api/admin/users${search ? `?${search}` : ""}`;
}

async function adminFetch(path: string): Promise<Response> {
  return fetch(path, {
    credentials: "include",
    cache: "no-store",
  });
}

export async function listAdminUsers(
  query: AdminUserListQuery = {},
): Promise<AdminUserList> {
  const response = await adminFetch(adminUsersPath(query));

  if (!response.ok) {
    throw new Error("Failed to load users");
  }

  return (await response.json()) as AdminUserList;
}

export async function getAdminUser(id: string): Promise<AdminUser | null> {
  const response = await adminFetch(`/api/admin/users/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load user");
  }

  return (await response.json()) as AdminUser;
}
