import { Separator } from "@brigada/ui/components/separator";
import { StarRating } from "@brigada/ui/components/star-rating";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "../../../components/book-cover";
import { NominateBookDialog } from "../../../components/nominate-dialog";
import { ProgressForm } from "../../../components/progress-form";
import { ReviewForm } from "../../../components/review-form";
import { readJson } from "../../../lib/read-api";
import type { BookPage } from "../../../lib/read-types";
import { requireReadMember } from "../../../lib/require-member";
import { bookStatusLabel } from "../../../lib/status";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await readJson<BookPage>(`/api/read/books/${slug}`).catch(
    () => null,
  );
  if (!data) {
    return { title: "Book" };
  }

  return {
    title: data.book.title,
    description:
      data.book.subtitle ?? `${data.book.title} by ${data.book.author}`,
  };
}

function formatRating(rating: number) {
  return `${rating / 2} / 5`;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  await requireReadMember();
  const { slug } = await params;
  const { review: reviewQuery } = await searchParams;
  const data = await readJson<BookPage>(`/api/read/books/${slug}`);
  if (!data) {
    notFound();
  }

  const { book, reviews, viewer } = data;
  const canReview = viewer?.canReview ?? false;
  const ownReview = viewer?.review ?? null;
  const ownProgress = viewer?.progress ?? null;
  const average =
    reviews.length === 0
      ? null
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  return (
    <main className="flex flex-col gap-12">
      <section className="grid gap-6 md:grid-cols-[9rem_1fr] md:items-end">
        <div className="order-2 max-w-36 md:order-1">
          <BookCover
            alt={book.title}
            coverId={book.coverId}
            priority
            title={book.title}
          />
        </div>
        <div className="order-1 flex flex-col gap-5 md:order-2">
          <div className="flex flex-col gap-2">
            <h1 className="max-w-[14ch] text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="max-w-[65ch] text-muted-foreground">
                {book.subtitle}
              </p>
            ) : null}
            <p className="max-w-[65ch] text-muted-foreground tabular-nums">
              {bookStatusLabel(book.status)} · {book.author} · {book.pageCount}{" "}
              pages · {book.firstPublishYear}
              {average !== null ? ` · ${formatRating(average)}` : ""}
            </p>
          </div>
          {book.description ? (
            <p className="max-w-[65ch] text-base leading-relaxed">
              {book.description}
            </p>
          ) : null}
          {viewer.nomination ? (
            <p className="max-w-prose text-sm leading-relaxed">
              <span className="text-muted-foreground">
                {viewer.nomination.nominatorName}:{" "}
              </span>
              {viewer.nomination.reason}
            </p>
          ) : viewer.canNominate ? (
            <NominateBookDialog book={{ id: book.id, title: book.title }} />
          ) : null}
          {ownProgress ? (
            <ProgressForm
              bookId={book.id}
              initialNotes={ownProgress.notes}
              initialPercentage={ownProgress.percentage}
            />
          ) : null}
          {canReview || ownReview ? (
            <ReviewForm
              bookId={book.id}
              defaultOpen={reviewQuery === "1"}
              review={ownReview}
            />
          ) : null}
        </div>
      </section>
      <section className="flex max-w-prose flex-col gap-5">
        <h2 className="text-base font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {canReview
              ? "No reviews yet. Yours can be the first."
              : book.status === "readlist"
                ? "Reviews open when the club starts this book."
                : "No reviews yet."}
          </p>
        ) : (
          <ul className="flex flex-col">
            {reviews.map((review, index) => (
              <li key={review.id}>
                {index > 0 ? <Separator className="my-5" /> : null}
                <article className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      className="font-medium hover:underline"
                      href={`/members/${review.username}`}
                    >
                      {review.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <StarRating value={review.rating} />
                      <p className="text-sm text-muted-foreground">
                        {formatRating(review.rating)}
                      </p>
                    </div>
                  </div>
                  {review.body ? (
                    <p className="max-w-[65ch] text-base leading-relaxed">
                      {review.body}
                    </p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
