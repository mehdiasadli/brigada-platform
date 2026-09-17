"use client";

import { Badge } from "@brigada/ui/components/badge";
import { DataTable } from "@brigada/ui/components/data-table";
import { useRouter } from "next/navigation";
import type { AdminUser } from "../../../lib/admin-users";
import { type UsersPageQuery, usersHref } from "../../../lib/users-query";

function sortHref(query: UsersPageQuery, sort: UsersPageQuery["sort"]) {
  const order = query.sort === sort && query.order === "desc" ? "asc" : "desc";

  return usersHref({ ...query, sort, order, page: 1 });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function UsersTable({
  users,
  query,
}: {
  users: {
    items: AdminUser[];
    page: number;
    limit: number;
    totalPages: number;
  };
  query: UsersPageQuery;
}) {
  const router = useRouter();

  return (
    <DataTable
      columns={[
        {
          id: "username",
          header: "Username",
          sortHref: sortHref(query, "username"),
          sortDirection: query.sort === "username" ? query.order : undefined,
          cell: (user) => `@${user.username}`,
        },
        {
          id: "name",
          header: "Name",
          sortHref: sortHref(query, "name"),
          sortDirection: query.sort === "name" ? query.order : undefined,
          cell: (user) => user.name,
        },
        {
          id: "role",
          header: "Role",
          cell: (user) => <Badge variant="secondary">{user.role}</Badge>,
        },
        {
          id: "createdAt",
          header: "Created",
          sortHref: sortHref(query, "createdAt"),
          sortDirection: query.sort === "createdAt" ? query.order : undefined,
          cell: (user) => formatDate(user.createdAt),
        },
      ]}
      data={users.items}
      getLimitHref={(limit) => usersHref({ ...query, limit, page: 1 })}
      getPageHref={(page) => usersHref({ ...query, page })}
      getRowKey={(user) => user.id}
      onRowClick={(user) => router.push(usersHref({ ...query, user: user.id }))}
      limit={users.limit}
      page={users.page}
      pageCount={users.totalPages}
    />
  );
}
