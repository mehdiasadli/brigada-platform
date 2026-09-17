import type { Metadata } from "next";
import { getAdminUser, listAdminUsers } from "../../../lib/admin-users";
import { parseUsersPageQuery, usersHref } from "../../../lib/users-query";
import { UserSheet } from "./user-sheet";
import { UsersHeader } from "./users-header";
import { UsersTable } from "./users-table";

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
  const usersPromise = listAdminUsers(query);
  const selectedPromise = query.user
    ? getAdminUser(query.user)
    : Promise.resolve(null);
  const [users, selected] = await Promise.all([usersPromise, selectedPromise]);

  return (
    <div className="flex flex-col gap-6">
      <UsersHeader total={users.total} />
      <UsersTable query={query} users={users} />
      <UserSheet
        closeHref={usersHref({ ...query, user: undefined })}
        user={selected}
      />
    </div>
  );
}
