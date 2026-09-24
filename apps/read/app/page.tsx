import { Button } from "@brigada/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@brigada/ui/components/empty";
import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { BookCover } from "../components/book-cover";
import { NominateBookDialog } from "../components/nominate-dialog";
import { ProgressForm } from "../components/progress-form";
import { ReaderBoard } from "../components/reader-board";
import { ReviewForm } from "../components/review-form";
import { SessionCard } from "../components/session-card";
import { VoteChoice } from "../components/vote-choice";
import { readJson } from "../lib/read-api";
import type { CurrentSession, MemberSessionSummary } from "../lib/read-types";
import { requireReadMember } from "../lib/require-member";

export const metadata: Metadata = {
  title: "Now reading",
  description: "The book the club is reading now.",
};

const titleClass =
  "max-w-[14ch] text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl";

export default async function Page() {
  const auth = await requireReadMember();
  const [current, archive] = await Promise.all([
    readJson<CurrentSession>("/api/read/me/session"),
    readJson<MemberSessionSummary[]>("/api/read/sessions"),
  ]);
  const lastCompleted = (archive ?? []).find(
    (session) => session.status === "completed",
  );

  return (
    <main className="flex flex-col gap-12">
      {current ? (
        <CurrentSessionHero current={current} youId={auth.user.id} />
      ) : (
        <Empty className="items-start rounded-none p-0 text-left">
          <EmptyHeader className="max-w-none items-start text-left">
            <h1 className={titleClass}>Nothing is open</h1>
            <EmptyDescription>
              Nominate a book, or wait for the next vote in Discord.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NominateBookDialog />
            <Button render={<Link href="/books" />} variant="ghost">
              Browse books
            </Button>
          </EmptyContent>
        </Empty>
      )}
      {!current && lastCompleted ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Last session</h2>
          <div className="border-t border-foreground/15">
            <SessionCard session={lastCompleted} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function CurrentSessionHero({
  current,
  youId,
}: {
  current: NonNullable<CurrentSession>;
  youId: string;
}) {
  const { session, progress } = current;
  const book = session.book;
  const showBoard =
    session.status === "active" || session.status === "completed";

  if (session.status === "voting") {
    return (
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className={titleClass}>Vote in Discord</h1>
          <p className="max-w-md text-muted-foreground">
            The ballot is in the reading channel. The reasons are here.
          </p>
        </div>
        <ol className="border-t border-foreground/15">
          {session.candidates.map((candidate, index) => (
            <VoteChoice
              choice={candidate}
              index={index + 1}
              key={candidate.slug ?? candidate.title}
            />
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-10">
      <div className="grid gap-6 md:grid-cols-[9rem_1fr] md:items-end">
        {book ? (
          <Link
            className="order-2 block max-w-36 md:order-1"
            href={`/books/${book.slug}`}
          >
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
        <div className="order-1 flex flex-col gap-4 md:order-2">
          <h1 className={titleClass}>{book?.title ?? "Current book"}</h1>
          {book ? (
            <p className="text-muted-foreground tabular-nums">
              {session.status === "completed" ? "Finished · " : null}
              {book.author} · {book.pageCount} pages
              {session.readingDeadline
                ? ` · Finish by ${format(parseISO(session.readingDeadline), "d MMM yyyy")}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>
      {session.status === "active" && progress ? (
        <ProgressForm
          bookId={book?.id}
          initialNotes={progress.notes}
          initialPercentage={progress.percentage}
        />
      ) : null}
      {book ? (
        <div className="flex flex-wrap items-center gap-4">
          <Link
            className="text-sm underline underline-offset-4"
            href={`/books/${book.slug}`}
          >
            Book page
          </Link>
          {current.canReview || current.review ? (
            <ReviewForm bookId={book.id} review={current.review} />
          ) : null}
        </div>
      ) : null}
      {showBoard ? (
        <ReaderBoard readers={session.readers} youId={youId} />
      ) : null}
    </section>
  );
}
