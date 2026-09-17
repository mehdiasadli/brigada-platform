"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import { Skeleton } from "@brigada/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CircleAlertIcon } from "lucide-react";
import { startTransition } from "react";
import {
  type AdminUser,
  adminUsersQueryKey,
  listAdminUsers,
} from "../../../lib/admin-users";
import { useUsersQuery } from "../../../lib/use-users-query";
import type { UserSortField } from "../../../lib/users-query";
import { UserSheet } from "./user-sheet";
import { UsersTable } from "./users-table";

export function UsersPage() {
  const [query, setQuery] = useUsersQuery();
  const users = useQuery({
    queryKey: adminUsersQueryKey({
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order,
    }),
    queryFn: () =>
      listAdminUsers({
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        order: query.order,
      }),
    placeholderData: keepPreviousData,
  });

  function updateQuery(
    next: Partial<{
      page: number;
      limit: number;
      sort: UserSortField;
      order: "asc" | "desc";
      user: string | null;
    }>,
  ) {
    startTransition(() => {
      void setQuery(next);
    });
  }

  function handleSort(field: UserSortField) {
    const order =
      query.sort === field && query.order === "desc" ? "asc" : "desc";
    updateQuery({ sort: field, order, page: 1 });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Users</h1>
        {users.isPending && !users.data ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {users.data?.total ?? 0}{" "}
            {users.data?.total === 1 ? "person" : "people"} on Brigada.
          </p>
        )}
      </div>
      {users.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not load users</AlertTitle>
          <AlertDescription>
            Check your connection and try again.
          </AlertDescription>
          <AlertAction>
            <Button
              onClick={() => void users.refetch()}
              size="sm"
              variant="outline"
            >
              Try again
            </Button>
          </AlertAction>
        </Alert>
      ) : (
        <UsersTable
          limit={query.limit}
          loading={users.isFetching}
          onLimitChange={(limit) => updateQuery({ limit, page: 1 })}
          onPageChange={(page) => updateQuery({ page })}
          onRowClick={(user: AdminUser) => updateQuery({ user: user.id })}
          onSort={handleSort}
          order={query.order}
          page={users.data?.page ?? query.page}
          pageCount={users.data?.totalPages ?? 1}
          selectedId={query.user ?? undefined}
          sort={query.sort}
          users={users.data?.items ?? []}
        />
      )}
      <UserSheet
        onClose={() => updateQuery({ user: null })}
        userId={query.user}
      />
    </div>
  );
}
