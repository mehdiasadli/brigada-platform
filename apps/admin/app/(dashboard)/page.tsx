import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@brigada/ui/components/card";
import type { Metadata } from "next";
import { listAdminUsers } from "../../lib/admin-users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
  description: "Brigada admin overview.",
};

export default async function Page() {
  const users = await listAdminUsers({ limit: 1 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of the people on Brigada.
        </p>
      </div>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Everyone who has signed in.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-medium">{users.total}</p>
        </CardContent>
      </Card>
    </div>
  );
}
