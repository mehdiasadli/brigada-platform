"use client";

import { Badge } from "@brigada/ui/components/badge";
import { DataTable } from "@brigada/ui/components/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import { format, parseISO } from "date-fns";
import { UsersIcon } from "lucide-react";
import type { AdminUser } from "../../../lib/admin-users";
import type { UserSortField } from "../../../lib/users-query";

export function UsersTable({
  users,
  page,
  pageCount,
  limit,
  sort,
  order,
  selectedId,
  loading,
  onSort,
  onPageChange,
  onLimitChange,
  onRowClick,
}: {
  users: AdminUser[];
  page: number;
  pageCount: number;
  limit: number;
  sort: UserSortField;
  order: "asc" | "desc";
  selectedId?: string;
  loading: boolean;
  onSort: (field: UserSortField) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRowClick: (user: AdminUser) => void;
}) {
  return (
    <DataTable
      columns={[
        {
          id: "username",
          header: "Username",
          sortable: true,
          sortDirection: sort === "username" ? order : undefined,
          cell: (user) => `@${user.username}`,
        },
        {
          id: "name",
          header: "Name",
          sortable: true,
          sortDirection: sort === "name" ? order : undefined,
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
          sortable: true,
          sortDirection: sort === "createdAt" ? order : undefined,
          cell: (user) => format(parseISO(user.createdAt), "MMM d, yyyy"),
        },
      ]}
      data={users}
      empty={
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>No users yet</EmptyTitle>
            <EmptyDescription>
              Accounts appear here after someone signs in.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      }
      getRowKey={(user) => user.id}
      limit={limit}
      loading={loading}
      onLimitChange={onLimitChange}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
      onSort={(columnId) => onSort(columnId as UserSortField)}
      page={page}
      pageCount={pageCount}
      selectedKey={selectedId}
    />
  );
}
