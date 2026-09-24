export type RatingBucket = {
  label: string;
  count: number;
  lead: boolean;
};

export function ratingBuckets(reviews: { rating: number }[]): RatingBucket[] {
  const counts = Array.from({ length: 10 }, (_, index) => ({
    label: String((index + 1) / 2),
    count: 0,
    lead: false,
  }));

  for (const review of reviews) {
    const bucket = counts[review.rating - 1];
    if (bucket) {
      bucket.count += 1;
    }
  }

  let peak = 0;
  for (const row of counts) {
    if (row.count > peak) {
      peak = row.count;
    }
  }

  if (peak > 0) {
    for (const row of counts) {
      row.lead = row.count === peak;
    }
  }

  return [...counts].reverse();
}
