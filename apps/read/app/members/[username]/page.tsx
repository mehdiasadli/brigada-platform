import { format, parseISO } from "date-fns";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewBlock } from "../../../components/review-block";
import { readJson } from "../../../lib/read-api";
import { requireReadMember } from "../../../lib/require-member";

type Profile = {
  user: { name: string; username: string };
  memberSince: string;
  reviews: Array<{
    id: string;
    bookTitle: string;
    bookSlug: string;
    rating: number;
    body: string | null;
  }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await readJson<Profile>(`/api/read/members/${username}`);
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
    <main className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
          {profile.user.name}
        </h1>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Username</dt>
            <dd>@{profile.user.username}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Member since</dt>
            <dd className="tabular-nums">
              {format(parseISO(profile.memberSince), "d MMM yyyy")}
            </dd>
          </div>
        </dl>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Reviews</h2>
        {profile.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="border-t border-foreground/15">
            {profile.reviews.map((review) => (
              <li key={review.id}>
                <ReviewBlock
                  body={review.body}
                  href={`/books/${review.bookSlug}`}
                  rating={review.rating}
                  title={review.bookTitle}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
