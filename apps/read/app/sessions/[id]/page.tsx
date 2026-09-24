import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "../../../components/book-cover";
import { ReaderBoard } from "../../../components/reader-board";
import { VoteChoice } from "../../../components/vote-choice";
import { readJson } from "../../../lib/read-api";
import type { MemberSession } from "../../../lib/read-types";
import { requireReadMember } from "../../../lib/require-member";
import { sessionStatusLabel } from "../../../lib/status";

function formatDate(value: string | null, withTime = false) {
  if (!value) {
    return null;
  }

  return format(parseISO(value), withTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy");
}

function formatRating(rating: number) {
  return `${rating / 2} / 5`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await readJson<MemberSession>(
    `/api/read/sessions/${id}`,
  ).catch(() => null);
  if (!session) {
    return { title: "Session" };
  }

  return {
    title: session.book?.title ?? "Session",
    description: session.book
      ? `${session.book.title} by ${session.book.author}`
      : "A Brigada reading session.",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireReadMember();
  const { id } = await params;
  const session = await readJson<MemberSession>(`/api/read/sessions/${id}`);
  if (!session) {
    notFound();
  }

  const dates = [
    ["Vote started", formatDate(session.votingStartedAt, true)],
    ["Vote ended", formatDate(session.votingEndedAt, true)],
    ["Read started", formatDate(session.startedAt)],
    ["Finish by", formatDate(session.readingDeadline)],
    ["Completed", formatDate(session.completedAt)],
    ["Cancelled", formatDate(session.cancelledAt)],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const alsoRans = session.book
    ? session.candidates.filter(
        (candidate) => candidate.bookId !== session.book?.id,
      )
    : session.candidates;

  return (
    <main className="flex flex-col gap-10">
      <section className="grid gap-6 md:grid-cols-[9rem_1fr] md:items-end">
        {session.book ? (
          <Link
            className="order-2 block max-w-36 md:order-1"
            href={`/books/${session.book.slug}`}
          >
            <BookCover
              alt={session.book.title}
              coverId={session.book.coverId}
              priority
              title={session.book.title}
            />
          </Link>
        ) : (
          <BookCover coverId={null} title="Session" />
        )}
        <div className="order-1 flex flex-col gap-3 md:order-2">
          <h1 className="max-w-[14ch] text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
            {session.book?.title ?? "Session"}
          </h1>
          <p className="text-muted-foreground">
            {sessionStatusLabel(session.status)}
            {session.book
              ? ` · ${session.book.author}, ${session.book.pageCount} pages`
              : null}
            {session.averageRating !== null
              ? ` · ${formatRating(session.averageRating)}`
              : ""}
          </p>
          {dates.length > 0 ? (
            <p className="text-sm text-muted-foreground tabular-nums">
              {dates.map(([label, value]) => `${label} ${value}`).join(" · ")}
            </p>
          ) : null}
        </div>
      </section>
      {alsoRans.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            {session.book ? "Also on the vote" : "Up for a vote"}
          </h2>
          <ol className="border-t border-foreground/15">
            {alsoRans.map((candidate, index) => (
              <VoteChoice
                choice={candidate}
                index={index + 1}
                key={candidate.slug ?? candidate.title}
              />
            ))}
          </ol>
        </section>
      ) : null}
      <ReaderBoard readers={session.readers} youId={auth.user.id} />
    </main>
  );
}
