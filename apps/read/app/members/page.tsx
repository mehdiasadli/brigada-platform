import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@brigada/ui/components/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { initials } from "../../lib/initials";
import { readJson } from "../../lib/read-api";
import { requireReadMember } from "../../lib/require-member";

export const metadata: Metadata = {
  title: "Members",
  description: "People in the Brigada reading club.",
};

type DirectoryMember = {
  name: string;
  username: string;
  image: string | null;
  memberSince: string;
};

export default async function Page() {
  const auth = await requireReadMember();
  const members =
    (await readJson<DirectoryMember[]>("/api/read/members")) ?? [];
  const me = auth.user.username;

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Members
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Everyone with a seat in the club.
        </p>
      </div>
      {members.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No members yet</EmptyTitle>
            <EmptyDescription>
              An admin can grant reading club access.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col">
          {members.map((member) => (
            <li key={member.username}>
              <Link
                className="flex items-center gap-4 border-b py-4 last:border-b-0 hover:bg-muted/40"
                href={`/members/${member.username}`}
              >
                <Avatar size="lg">
                  {member.image ? (
                    <AvatarImage alt={member.name} src={member.image} />
                  ) : null}
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-muted-foreground">
                    @{member.username}
                    {member.username === me ? " · You" : ""} · joined{" "}
                    {format(parseISO(member.memberSince), "d MMM yyyy")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
