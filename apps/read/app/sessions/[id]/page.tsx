import { Badge } from "@brigada/ui/components/badge";
import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "../../../components/book-cover";
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
  await requireReadMember();
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
      <section className="grid gap-8 md:grid-cols-[13rem_1fr] md:items-start lg:grid-cols-[16rem_1fr]">
        {session.book ? (
          <Link className="block" href={`/books/${session.book.slug}`}>
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
        <div className="flex flex-col gap-4">
          <Badge className="w-fit" variant="secondary">
            {sessionStatusLabel(session.status)}
          </Badge>
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            {session.book?.title ?? "Session"}
          </h1>
          {session.book ? (
            <p className="text-muted-foreground">
              {session.book.author}, {session.book.pageCount} pages
            </p>
          ) : null}
          {session.averageRating !== null ? (
            <p className="text-sm text-muted-foreground">
              Club rating {formatRating(session.averageRating)}
            </p>
          ) : null}
          {dates.length > 0 ? (
            <dl className="grid max-w-md grid-cols-2 gap-3 text-sm">
              {dates.map(([label, value]) => (
                <div className="flex flex-col gap-0.5" key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>
      {alsoRans.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-medium tracking-tight">
            {session.book ? "Also on the slate" : "Slate"}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {alsoRans.map((candidate) => (
              <div
                className="flex flex-col gap-2"
                key={candidate.slug ?? candidate.title}
              >
                <BookCover
                  coverId={candidate.coverId}
                  title={candidate.title}
                />
                {candidate.slug ? (
                  <Link
                    className="line-clamp-2 font-medium hover:underline"
                    href={`/books/${candidate.slug}`}
                  >
                    {candidate.title}
                  </Link>
                ) : (
                  <p className="line-clamp-2 font-medium">{candidate.title}</p>
                )}
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {candidate.author}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className="flex max-w-xl flex-col gap-3">
        <h2 className="text-xl font-medium tracking-tight">Readers</h2>
        <ReaderBoard readers={session.readers} />
      </section>
    </main>
  );
}
