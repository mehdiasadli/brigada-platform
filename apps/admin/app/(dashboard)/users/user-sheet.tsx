"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@brigada/ui/components/avatar";
import { Badge } from "@brigada/ui/components/badge";
import { Separator } from "@brigada/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@brigada/ui/components/sheet";
import { Skeleton } from "@brigada/ui/components/skeleton";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { adminUserQueryKey, getAdminUser } from "../../../lib/admin-users";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "None";
  }

  return format(parseISO(value), "MMM d, yyyy 'at' h:mm a");
}

export function UserSheet({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const userQuery = useQuery({
    queryKey: userId ? adminUserQueryKey(userId) : ["admin-user", "idle"],
    queryFn: () => getAdminUser(userId as string),
    enabled: userId !== null,
    placeholderData: keepPreviousData,
  });

  const user = userQuery.data ?? null;

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={userId !== null}
    >
      <SheetContent>
        {userQuery.isPending && !user ? (
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : null}
        {user ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  {user.image ? <AvatarImage alt="" src={user.image} /> : null}
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <SheetTitle>@{user.username}</SheetTitle>
                  <SheetDescription>{user.name}</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4">
              <Badge className="w-fit" variant="secondary">
                {user.role}
              </Badge>
              <Separator />
              <dl className="flex flex-col gap-4">
                <Field label="Email" value={user.email} />
                <Field
                  label="Email verified"
                  value={user.emailVerified ? "Yes" : "No"}
                />
                <Field
                  label="Two-factor"
                  value={user.twoFactorEnabled ? "Enabled" : "Off"}
                />
                <Field
                  label="Banned"
                  value={user.banned ? (user.banReason ?? "Yes") : "No"}
                />
                <Field label="Created" value={formatDateTime(user.createdAt)} />
                <Field label="Updated" value={formatDateTime(user.updatedAt)} />
              </dl>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
