"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@brigada/ui/components/alert";
import { Button } from "@brigada/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@brigada/ui/components/card";
import { Skeleton } from "@brigada/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CircleAlertIcon } from "lucide-react";
import Link from "next/link";
import { adminUsersQueryKey, listAdminUsers } from "../../lib/admin-users";

export function Overview() {
  const users = useQuery({
    queryKey: adminUsersQueryKey({ limit: 1 }),
    queryFn: () => listAdminUsers({ limit: 1 }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of the people on Brigada.
        </p>
      </div>
      {users.isError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Could not load users</AlertTitle>
          <AlertDescription>
            Check your connection and try again.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Everyone who has signed in.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {users.isPending ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-medium">{users.data?.total ?? 0}</p>
            )}
            <Button
              className="w-fit"
              nativeButton={false}
              render={<Link href="/users" />}
              variant="outline"
            >
              Open users
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
