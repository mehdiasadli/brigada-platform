import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "../../../components/review-form";
import { readJson } from "../../../lib/read-api";
import type { CurrentSession, ReadBook } from "../../../lib/read-types";
import { requireReadMember } from "../../../lib/require-member";

type BookPage = {
  book: ReadBook;
  reviews: Array<{
    id: string;
    username: string;
    name: string;
    body: string | null;
    rating: number;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await readJson<BookPage>(`/api/read/books/${slug}`);
  if (!data) {
    return { title: "Book" };
  }

  return {
    title: data.book.title,
    description:
      data.book.subtitle ?? `${data.book.title} by ${data.book.author}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireReadMember();
  const { slug } = await params;
  const data = await readJson<BookPage>(`/api/read/books/${slug}`);
  if (!data) {
    notFound();
  }

  const current = await readJson<CurrentSession>("/api/read/me/session");
  const canReview =
    current?.session.book?.id === data.book.id &&
    Boolean(current.progress?.isCompleted);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{data.book.status}</p>
        <h1 className="text-2xl font-medium">{data.book.title}</h1>
        <p className="text-muted-foreground">
          {data.book.author} · {data.book.pageCount} pages ·{" "}
          {data.book.firstPublishYear}
        </p>
        {data.book.description ? (
          <p className="text-sm">{data.book.description}</p>
        ) : null}
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Reviews</h2>
        {data.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          data.reviews.map((review) => (
            <article className="flex flex-col gap-1" key={review.id}>
              <Link
                className="text-sm font-medium underline"
                href={`/members/${review.username}`}
              >
                {review.name} · {review.rating / 2}
              </Link>
              {review.body ? <p className="text-sm">{review.body}</p> : null}
            </article>
          ))
        )}
      </section>
      {canReview ? <ReviewForm bookId={data.book.id} /> : null}
    </main>
  );
}
