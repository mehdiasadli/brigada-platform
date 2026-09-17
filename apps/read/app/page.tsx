import { Badge } from "@brigada/ui/components/badge";
import { Button } from "@brigada/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { BookCover } from "../components/book-cover";
import { ProgressForm } from "../components/progress-form";
import { ReviewForm } from "../components/review-form";
import { readJson } from "../lib/read-api";
import type { CurrentSession } from "../lib/read-types";
import { requireReadMember } from "../lib/require-member";
import { sessionStatusLabel } from "../lib/status";

export const metadata: Metadata = {
  title: "Now reading",
  description: "The book the club is reading now.",
};

export default async function Page() {
  await requireReadMember();
  const current = await readJson<CurrentSession>("/api/read/me/session");

  return (
    <main className="flex flex-col gap-12">
      {current ? (
        <CurrentSessionHero current={current} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No session yet</EmptyTitle>
            <EmptyDescription>
              An admin will start the next vote in Discord. Browse the list
              while you wait.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/books" />}>Browse books</Button>
          </EmptyContent>
        </Empty>
      )}
    </main>
  );
}

function CurrentSessionHero({
  current,
}: {
  current: NonNullable<CurrentSession>;
}) {
  const { session, progress } = current;
  const book = session.book;

  if (session.status === "voting") {
    return (
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit" variant="secondary">
            {sessionStatusLabel(session.status)}
          </Badge>
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            Vote in Discord
          </h1>
          <p className="max-w-xl text-muted-foreground">
            The slate is up. Cast your votes in the reading channel.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {session.candidates.map((candidate) => (
            <div
              className="flex flex-col gap-2"
              key={candidate.slug ?? candidate.title}
            >
              <BookCover coverId={candidate.coverId} title={candidate.title} />
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
    );
  }

  return (
    <section className="grid gap-8 md:grid-cols-[13rem_1fr] md:items-start lg:grid-cols-[16rem_1fr]">
      {book ? (
        <Link className="block" href={`/books/${book.slug}`}>
          <BookCover
            alt={book.title}
            coverId={book.coverId}
            priority
            title={book.title}
          />
        </Link>
      ) : (
        <BookCover coverId={null} title="Current book" />
      )}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Badge className="w-fit" variant="secondary">
            {sessionStatusLabel(session.status)}
          </Badge>
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            {book?.title ?? "Current book"}
          </h1>
          {book ? (
            <p className="text-muted-foreground">
              {book.author}, {book.pageCount} pages
            </p>
          ) : null}
          {session.readingDeadline ? (
            <p className="text-sm text-muted-foreground">
              Finish by{" "}
              {format(parseISO(session.readingDeadline), "d MMM yyyy")}
            </p>
          ) : null}
        </div>
        {book ? (
          <div className="flex flex-wrap gap-2">
            <Button
              render={<Link href={`/books/${book.slug}`} />}
              variant="outline"
            >
              Open book
            </Button>
            {current.canReview ? <ReviewForm bookId={book.id} /> : null}
          </div>
        ) : null}
        {session.status === "active" && !progress?.isCompleted ? (
          <ProgressForm
            initialNotes={progress?.notes ?? null}
            initialPercentage={progress?.percentage ?? 0}
          />
        ) : progress?.isCompleted ? (
          <p className="text-sm text-muted-foreground">Finished</p>
        ) : null}
      </div>
    </section>
  );
}
