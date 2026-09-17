import type { Metadata } from "next";
import { listAdminUsers } from "../../../lib/admin-users";
import { parseUsersPageQuery } from "../../../lib/users-query";
import { UsersHeader } from "./users-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage Brigada users.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseUsersPageQuery(await searchParams);
  const users = await listAdminUsers(query);

  return (
    <div className="flex flex-col gap-6">
      <UsersHeader total={users.total} />
    </div>
  );
}
