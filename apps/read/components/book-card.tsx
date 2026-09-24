import Link from "next/link";
import type { ReadBook } from "../lib/read-types";
import { bookStatusLabel } from "../lib/status";
import { BookCover } from "./book-cover";

export function BookCard({ book }: { book: ReadBook }) {
  const reading = book.status === "reading";

  return (
    <Link className="group flex flex-col gap-2" href={`/books/${book.slug}`}>
      <BookCover coverId={book.coverId} title={book.title} />
      <p
        className={
          reading
            ? "line-clamp-2 font-medium underline decoration-primary decoration-2 underline-offset-4"
            : "line-clamp-2 font-medium group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4"
        }
      >
        {book.title}
      </p>
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {book.author}
        {book.status === "readlist" ? "" : ` · ${bookStatusLabel(book.status)}`}
      </p>
    </Link>
  );
}
