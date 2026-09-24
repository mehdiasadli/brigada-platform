import { format, parseISO } from "date-fns";
import Link from "next/link";
import type { MemberSessionSummary } from "../lib/read-types";
import { sessionStatusLabel } from "../lib/status";
import { BookCover } from "./book-cover";

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return format(parseISO(value), "d MMM yyyy");
}

export function SessionCard({ session }: { session: MemberSessionSummary }) {
  const finished = formatDate(session.completedAt);
  const started = formatDate(session.startedAt);

  return (
    <Link
      className="group grid grid-cols-[3.25rem_1fr] items-start gap-4 border-b border-foreground/15 py-4 last:border-b-0"
      href={`/sessions/${session.id}`}
    >
      <BookCover
        coverId={session.book?.coverId ?? null}
        title={session.book?.title ?? "Session"}
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-medium group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4">
          {session.book?.title ?? "No book yet"}
        </span>
        {session.book ? (
          <span className="text-sm text-muted-foreground">
            {session.book.author}
          </span>
        ) : null}
        <span className="text-sm text-muted-foreground">
          {sessionStatusLabel(session.status)}
          {started ? ` · Started ${started}` : ""}
          {finished ? ` · Finished ${finished}` : ""}
          {!started && !finished ? ` · ${session.readerCount} readers` : ""}
        </span>
      </span>
    </Link>
  );
}
