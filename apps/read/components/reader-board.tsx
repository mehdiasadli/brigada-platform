import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@brigada/ui/components/avatar";
import Link from "next/link";
import { initials } from "../lib/initials";
import type { MemberSessionReader } from "../lib/read-types";

export function ReaderBoard({ readers }: { readers: MemberSessionReader[] }) {
  const visible = readers.filter(
    (reader) => reader.participation !== "sat_out",
  );
  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No readers on this session.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {visible.map((reader) => (
        <li key={reader.userId}>
          <Link
            className="flex items-center gap-3 border-b py-3 last:border-b-0 hover:bg-muted/40"
            href={`/members/${reader.username}`}
          >
            <Avatar>
              {reader.image ? (
                <AvatarImage alt={reader.name} src={reader.image} />
              ) : null}
              <AvatarFallback>{initials(reader.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="font-medium">{reader.name}</span>
            </span>
            <span className="text-sm text-muted-foreground">
              {reader.participation === "dnf"
                ? "Did not finish"
                : reader.progress?.isCompleted
                  ? "Finished"
                  : reader.progress
                    ? `${reader.progress.percentage}%`
                    : "Not started"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
