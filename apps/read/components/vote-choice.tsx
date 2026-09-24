import Link from "next/link";
import type { MemberSession } from "../lib/read-types";
import { BookCover } from "./book-cover";

type Choice = MemberSession["candidates"][number];

export function VoteChoice({
  choice,
  index,
}: {
  choice: Choice;
  index: number;
}) {
  const title = choice.slug ? (
    <Link
      className="font-medium underline-offset-4 hover:underline"
      href={`/books/${choice.slug}`}
    >
      {choice.title}
    </Link>
  ) : (
    <p className="font-medium">{choice.title}</p>
  );

  return (
    <li className="grid grid-cols-[2.25rem_3.25rem_1fr] items-start gap-3 border-b border-foreground/15 py-4">
      <span className="pt-1 font-mono text-xs tabular-nums text-muted-foreground">
        {String(index).padStart(2, "0")}
      </span>
      <BookCover coverId={choice.coverId} title={choice.title} />
      <div className="flex min-w-0 flex-col gap-1">
        {title}
        <p className="text-sm text-muted-foreground">{choice.author}</p>
        {choice.nominationReason ? (
          <p className="text-sm leading-relaxed">
            {choice.nominatorName ? (
              <span className="text-muted-foreground">
                {choice.nominatorName}:{" "}
              </span>
            ) : null}
            {choice.nominationReason}
          </p>
        ) : null}
      </div>
    </li>
  );
}
