import { Badge } from "@brigada/ui/components/badge";
import Link from "next/link";
import type { ReadBook } from "../lib/read-types";
import { bookStatusLabel, bookStatusVariant } from "../lib/status";
import { BookCover } from "./book-cover";

export function BookCard({ book }: { book: ReadBook }) {
  return (
    <Link className="group flex flex-col gap-3" href={`/books/${book.slug}`}>
      <div className="transition-transform duration-200 ease-out group-hover:scale-[1.02] group-active:scale-[0.99] motion-reduce:transform-none">
        <BookCover coverId={book.coverId} title={book.title} />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="line-clamp-2 font-medium group-hover:underline">
          {book.title}
        </p>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {book.author}
        </p>
        <Badge className="w-fit" variant={bookStatusVariant(book.status)}>
          {bookStatusLabel(book.status)}
        </Badge>
      </div>
    </Link>
  );
}
