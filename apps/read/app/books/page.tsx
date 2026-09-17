import type { Metadata } from "next";
import Link from "next/link";
import { readJson } from "../../lib/read-api";
import type { ReadBook } from "../../lib/read-types";
import { requireReadMember } from "../../lib/require-member";

export const metadata: Metadata = {
  title: "Books",
  description: "Books on the Brigada reading list.",
};

export default async function Page() {
  await requireReadMember();
  const books = (await readJson<ReadBook[]>("/api/read/books")) ?? [];

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-medium">Books</h1>
      <ul className="flex flex-col gap-3">
        {books.map((book) => (
          <li key={book.id}>
            <Link
              className="font-medium underline"
              href={`/books/${book.slug}`}
            >
              {book.title}
            </Link>
            <p className="text-sm text-muted-foreground">
              {book.author} · {book.pageCount}p · {book.status}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
