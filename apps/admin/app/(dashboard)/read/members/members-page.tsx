"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import { Skeleton } from "@brigada/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@brigada/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CircleAlertIcon } from "lucide-react";
import { ActionError, firstError } from "../../../../components/action-error";
import {
  adminUsersQueryKey,
  listAdminUsers,
} from "../../../../lib/admin-users";
import {
  grantReadMember,
  listReadMembers,
  readMembersQueryKey,
  revokeReadMember,
} from "../../../../lib/read-admin";

export function ReadMembersPage() {
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: readMembersQueryKey(),
    queryFn: listReadMembers,
  });
  const users = useQuery({
    queryKey: adminUsersQueryKey({ limit: 100 }),
    queryFn: () => listAdminUsers({ limit: 100 }),
  });

  const grant = useMutation({
    mutationFn: grantReadMember,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: readMembersQueryKey() }),
  });
  const revoke = useMutation({
    mutationFn: revokeReadMember,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: readMembersQueryKey() }),
  });

  const memberIds = new Set((members.data ?? []).map((row) => row.user.id));
  const candidates = (users.data?.items ?? []).filter(
    (user) => !memberIds.has(user.id),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Reading Club members</h1>
        <p className="text-sm text-muted-foreground">
          Grant membership on an existing Brigada user. They become readers on
          the next vote.
        </p>
      </div>
      {members.isError || users.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not load members</AlertTitle>
          <AlertDescription>
            Check your connection and try again.
          </AlertDescription>
          <AlertAction>
            <Button
              onClick={() => {
                void members.refetch();
                void users.refetch();
              }}
              size="sm"
              variant="outline"
            >
              Try again
            </Button>
          </AlertAction>
        </Alert>
      ) : null}
      <ActionError error={firstError(grant.error, revoke.error)} />
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Members</h2>
        {members.isPending ? (
          <Skeleton className="h-32" />
        ) : members.data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.data.map((member) => (
                <TableRow key={member.user.id}>
                  <TableCell>{member.user.name}</TableCell>
                  <TableCell>{member.user.username}</TableCell>
                  <TableCell>
                    {format(parseISO(member.createdAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      disabled={revoke.isPending}
                      onClick={() => revoke.mutate(member.user.id)}
                      size="sm"
                      variant="outline"
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No members yet</EmptyTitle>
              <EmptyDescription>
                Grant membership from the list of Brigada users below.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Grant membership</h2>
        {users.isPending ? (
          <Skeleton className="h-24" />
        ) : candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Everyone on Brigada is already a member.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      disabled={grant.isPending}
                      onClick={() => grant.mutate(user.id)}
                      size="sm"
                    >
                      Grant
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
