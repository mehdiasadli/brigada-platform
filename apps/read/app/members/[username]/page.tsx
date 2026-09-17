import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readJson } from "../../../lib/read-api";
import { requireReadMember } from "../../../lib/require-member";

type Profile = {
  user: { name: string; username: string; image: string | null };
  memberSince: string;
  finishedCount: number;
  averageRating: number | null;
  current: { title: string; slug: string; percentage: number } | null;
  reviews: Array<{
    id: string;
    bookTitle: string;
    bookSlug: string;
    rating: number;
    body: string | null;
  }>;
};

function formatRating(rating: number) {
  return `${rating / 2} / 5`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await readJson<Profile>(
    `/api/read/members/${username}`,
  ).catch(() => null);
  return {
    title: profile?.user.name ?? username,
    description: `${username} on Read`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  await requireReadMember();
  const { username } = await params;
  const profile = await readJson<Profile>(`/api/read/members/${username}`);
  if (!profile) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">{profile.user.name}</h1>
        <p className="text-sm text-muted-foreground">
          @{profile.user.username} · member since{" "}
          {format(parseISO(profile.memberSince), "d MMM yyyy")}
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Finished</dt>
          <dd className="text-lg font-medium">{profile.finishedCount}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Average rating</dt>
          <dd className="text-lg font-medium">
            {profile.averageRating === null
              ? "No ratings"
              : formatRating(profile.averageRating)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Now</dt>
          <dd className="text-lg font-medium">
            {profile.current ? (
              <Link
                className="hover:underline"
                href={`/books/${profile.current.slug}`}
              >
                {profile.current.title} · {profile.current.percentage}%
              </Link>
            ) : (
              "Between books"
            )}
          </dd>
        </div>
      </dl>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Reviews</h2>
        {profile.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          profile.reviews.map((review) => (
            <article className="flex flex-col gap-1" key={review.id}>
              <Link
                className="font-medium underline"
                href={`/books/${review.bookSlug}`}
              >
                {review.bookTitle}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatRating(review.rating)}
              </p>
              {review.body ? <p className="text-sm">{review.body}</p> : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
