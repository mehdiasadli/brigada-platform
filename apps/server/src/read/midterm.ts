export function shouldPostMidterm(
  startedAt: Date,
  readingDeadline: Date,
  now: Date,
  alreadyPosted: Date | null,
) {
  if (alreadyPosted) {
    return false;
  }

  const midpoint =
    startedAt.getTime() + (readingDeadline.getTime() - startedAt.getTime()) / 2;

  return now.getTime() >= midpoint;
}
