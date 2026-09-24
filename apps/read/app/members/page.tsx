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
        <h1 className="text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
          Members
        </h1>
        <p className="max-w-xl text-muted-foreground">People in the club.</p>
      </div>
      {members.length === 0 ? (
        <Empty className="items-start rounded-none p-0 text-left">
          <EmptyHeader className="max-w-none items-start text-left">
            <EmptyTitle>No members yet</EmptyTitle>
            <EmptyDescription>
              An admin can add people to the club.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="border-t border-foreground/15">
          {members.map((member) => {
            const you = member.username === me;
            return (
              <li key={member.username}>
                <Link
                  className={
                    you
                      ? "group flex items-center gap-4 border-b-2 border-primary py-4"
                      : "group flex items-center gap-4 border-b border-foreground/15 py-4"
                  }
                  href={`/members/${member.username}`}
                >
                  <Avatar size="lg">
                    {member.image ? (
                      <AvatarImage alt={member.name} src={member.image} />
                    ) : null}
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-medium group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4">
                      {member.name}
                      {you ? (
                        <span className="ml-2 text-xs font-normal text-primary">
                          You
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      @{member.username} · joined{" "}
                      {format(parseISO(member.memberSince), "d MMM yyyy")}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
