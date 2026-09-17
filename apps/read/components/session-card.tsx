import { Badge } from "@brigada/ui/components/badge";
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
      className="grid grid-cols-[4.5rem_1fr] gap-4 border-b py-4 last:border-b-0 hover:bg-muted/40"
      href={`/sessions/${session.id}`}
    >
      <BookCover
        coverId={session.book?.coverId ?? null}
        title={session.book?.title ?? "Session"}
      />
      <span className="flex min-w-0 flex-col gap-1">
        <Badge className="w-fit" variant="secondary">
          {sessionStatusLabel(session.status)}
        </Badge>
        <span className="font-medium">
          {session.book?.title ?? "No book yet"}
        </span>
        {session.book ? (
          <span className="text-sm text-muted-foreground">
            {session.book.author}
          </span>
        ) : null}
        <span className="text-sm text-muted-foreground">
          {started ? `Started ${started}` : null}
          {started && finished ? " · " : null}
          {finished ? `Finished ${finished}` : null}
          {!started && !finished ? `${session.readerCount} readers` : null}
        </span>
      </span>
    </Link>
  );
}
