import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import type { Metadata } from "next";
import { SessionCard } from "../../components/session-card";
import { readJson } from "../../lib/read-api";
import type { MemberSessionSummary } from "../../lib/read-types";
import { requireReadMember } from "../../lib/require-member";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Past and current Brigada reading sessions.",
};

export default async function Page() {
  await requireReadMember();
  const sessions =
    (await readJson<MemberSessionSummary[]>("/api/read/sessions")) ?? [];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
          Sessions
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Every vote and book the club has run.
        </p>
      </div>
      {sessions.length === 0 ? (
        <Empty className="items-start rounded-none p-0 text-left">
          <EmptyHeader className="max-w-none items-start text-left">
            <EmptyTitle>No sessions yet</EmptyTitle>
            <EmptyDescription>
              The first vote will show up here after it starts in Discord.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="border-t border-foreground/15">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </main>
  );
}
