import { StarRating } from "@brigada/ui/components/star-rating";
import Link from "next/link";

export function ReviewBlock({
  href,
  title,
  rating,
  body,
}: {
  href: string;
  title: string;
  rating: number;
  body: string | null;
}) {
  return (
    <article className="flex flex-col gap-3 border-b border-foreground/15 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="font-medium underline-offset-4 hover:underline"
          href={href}
        >
          {title}
        </Link>
        <StarRating value={rating} />
      </div>
      {body ? (
        <p className="max-w-[65ch] text-base leading-relaxed">{body}</p>
      ) : null}
    </article>
  );
}
