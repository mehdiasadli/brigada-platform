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
import { useRouter } from "next/navigation";
import type { AdminUser } from "../../../lib/admin-users";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function UserSheet({
  user,
  closeHref,
}: {
  user: AdminUser | null;
  closeHref: string;
}) {
  const router = useRouter();

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          router.push(closeHref);
        }
      }}
      open={user !== null}
    >
      <SheetContent>
        {user ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  {user.image ? <AvatarImage src={user.image} /> : null}
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
                <Field label="Created" value={formatDate(user.createdAt)} />
                <Field label="Updated" value={formatDate(user.updatedAt)} />
              </dl>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
