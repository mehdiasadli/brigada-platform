import { z } from "@brigada/env";

const usersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "username", "name"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type UsersPageQuery = z.infer<typeof usersListQuerySchema> & {
  user?: string;
};

function first(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseUsersPageQuery(
  searchParams: Record<string, string | string[] | undefined>,
): UsersPageQuery {
  const parsed = usersListQuerySchema.safeParse({
    page: first(searchParams, "page"),
    limit: first(searchParams, "limit"),
    sort: first(searchParams, "sort"),
    order: first(searchParams, "order"),
  });
  const list = parsed.success
    ? parsed.data
    : {
        page: 1,
        limit: 20,
        sort: "createdAt" as const,
        order: "desc" as const,
      };
  const user = first(searchParams, "user");

  return user ? { ...list, user } : list;
}

export function usersHref(query: UsersPageQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  params.set("sort", query.sort);
  params.set("order", query.order);
  if (query.user) {
    params.set("user", query.user);
  }

  return `/users?${params.toString()}`;
}
