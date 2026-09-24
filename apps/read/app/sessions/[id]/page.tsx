import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlsoOnTheVote } from "../../../components/also-on-the-vote";
import { BookCover } from "../../../components/book-cover";
import { ParticipationForm } from "../../../components/participation-form";
import { ReaderBoard } from "../../../components/reader-board";
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
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{sessionStatusLabel(session.status)}</dd>
            </div>
            {session.book ? (
              <div>
                <dt className="text-muted-foreground">Author</dt>
                <dd>{session.book.author}</dd>
              </div>
            ) : null}
            {session.book ? (
              <div>
                <dt className="text-muted-foreground">Pages</dt>
                <dd className="tabular-nums">{session.book.pageCount}</dd>
              </div>
            ) : null}
            {session.averageRating !== null ? (
              <div>
                <dt className="text-muted-foreground">Average</dt>
                <dd className="tabular-nums">
                  {session.averageRating / 2} / 5
                </dd>
              </div>
            ) : null}
            {dates.map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {alsoRans.length > 0 ? (
        <AlsoOnTheVote
          choices={alsoRans}
          title={session.book ? "Also on the vote" : "Up for a vote"}
        />
      ) : null}
      {session.readers.some((reader) => reader.userId === auth.user.id) ? (
        <ParticipationForm
          participation={
            session.readers.find((reader) => reader.userId === auth.user.id)
              ?.participation ?? "reading"
          }
          sessionStatus={session.status}
        />
      ) : null}
      <ReaderBoard readers={session.readers} youId={auth.user.id} />
    </main>
  );
}
