import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { ProgressForm } from "../components/progress-form";
import { readJson } from "../lib/read-api";
import type { CurrentSession } from "../lib/read-types";
import { requireReadMember } from "../lib/require-member";

export const metadata: Metadata = {
  title: "Current book",
  description: "The book the club is reading now.",
};

export default async function Page() {
  await requireReadMember();
  const current = await readJson<CurrentSession>("/api/read/me/session");

  if (!current) {
    return (
      <main className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium">No active session</h1>
        <p className="text-muted-foreground">
          An admin will start the next vote in Discord.
        </p>
        <Link className="text-sm underline" href="/books">
          Browse books
        </Link>
      </main>
    );
  }

  const { session, progress } = current;
  const title = session.book?.title ?? "Voting";

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{session.status}</p>
        <h1 className="text-2xl font-medium">{title}</h1>
        {session.book ? (
          <p className="text-muted-foreground">
            {session.book.author} · {session.book.pageCount} pages
          </p>
        ) : (
          <p className="text-muted-foreground">
            {session.candidates.map((candidate) => candidate.title).join(" · ")}
          </p>
        )}
        {session.readingDeadline ? (
          <p className="text-sm text-muted-foreground">
            Deadline {format(parseISO(session.readingDeadline), "d MMM yyyy")}
          </p>
        ) : null}
      </div>
      {session.book ? (
        <Link
          className="text-sm underline"
          href={`/books/${session.book.slug}`}
        >
          Book page
        </Link>
      ) : null}
      {session.status === "active" ? (
        <ProgressForm
          initialNotes={progress?.notes ?? null}
          initialPercentage={progress?.percentage ?? 0}
        />
      ) : null}
    </main>
  );
}
