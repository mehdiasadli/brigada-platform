import Link from "next/link";
import type { MemberSessionReader } from "../lib/read-types";

function place(reader: MemberSessionReader) {
  if (reader.progress?.isCompleted) {
    return "Finished";
  }

  if (reader.progress) {
    return `${reader.progress.percentage}%`;
  }

  return "Not started";
}

export function ReaderBoard({
  readers,
  youId,
}: {
  readers: MemberSessionReader[];
  youId?: string;
}) {
  if (readers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No readers on this session.
      </p>
    );
  }

  return (
    <ol className="border-t border-foreground/15">
      {readers.map((reader, index) => {
        const you = reader.userId === youId;
        return (
          <li key={reader.userId}>
            <Link
              className={
                you
                  ? "flex items-baseline gap-4 border-b-2 border-primary py-3"
                  : "flex items-baseline gap-4 border-b border-foreground/15 py-3"
              }
              href={`/members/${reader.username}`}
            >
              <span className="w-8 font-mono text-xs tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 font-medium">
                {reader.name}
                {you ? (
                  <span className="ml-2 text-xs font-normal text-primary">
                    You
                  </span>
                ) : null}
              </span>
              <span className="font-mono text-sm tabular-nums">
                {place(reader)}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
