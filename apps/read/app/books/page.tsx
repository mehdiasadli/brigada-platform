import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@brigada/ui/components/empty";
import type { Metadata } from "next";
import { BookCard } from "../../components/book-card";
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
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Books
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Everything the club has nominated, is reading, or has finished.
        </p>
      </div>
      {books.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No books yet</EmptyTitle>
            <EmptyDescription>
              An admin can add books from OpenLibrary.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
        </div>
      )}
    </main>
  );
}
