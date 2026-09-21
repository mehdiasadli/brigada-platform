import { Badge } from "@brigada/ui/components/badge";
import { Separator } from "@brigada/ui/components/separator";
import { StarRating } from "@brigada/ui/components/star-rating";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "../../../components/book-cover";
import { ProgressForm } from "../../../components/progress-form";
import { ReviewForm } from "../../../components/review-form";
import { readJson } from "../../../lib/read-api";
import type { BookPage } from "../../../lib/read-types";
import { requireReadMember } from "../../../lib/require-member";
import { bookStatusLabel, bookStatusVariant } from "../../../lib/status";

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
      <section className="grid gap-8 md:grid-cols-[16rem_1fr] md:items-start lg:grid-cols-[18rem_1fr]">
        <BookCover
          alt={book.title}
          coverId={book.coverId}
          priority
          title={book.title}
        />
        <div className="flex flex-col gap-5">
          <Badge className="w-fit" variant={bookStatusVariant(book.status)}>
            {bookStatusLabel(book.status)}
          </Badge>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
              {book.title}
            </h1>
            {book.subtitle ? (
              <p className="text-muted-foreground">{book.subtitle}</p>
            ) : null}
            <p className="text-muted-foreground">{book.author}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4 sm:max-w-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">Pages</dt>
              <dd className="text-lg font-medium">{book.pageCount}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">Published</dt>
              <dd className="text-lg font-medium">{book.firstPublishYear}</dd>
            </div>
            {average !== null ? (
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">Club rating</dt>
                <dd className="text-lg font-medium">{formatRating(average)}</dd>
              </div>
            ) : null}
          </dl>
          {book.description ? (
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {book.description}
            </p>
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
        <h2 className="text-xl font-medium tracking-tight">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {canReview
              ? "Be the first to review this book."
              : ownReview
                ? "Your review is published below."
                : book.status === "readlist"
                  ? "Reviews open once the club starts this book."
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
                    <p className="text-sm leading-relaxed">{review.body}</p>
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
