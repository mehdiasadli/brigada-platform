import { Button } from "@brigada/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";
import { BooksCatalog } from "../../components/books-catalog";
import { requireReadMember } from "../../lib/require-member";

export const metadata: Metadata = {
  title: "Books",
  description: "Books on the Brigada reading list.",
};

export default async function Page() {
  await requireReadMember();

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
            Books
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Everything the club has nominated, is reading, or has finished.
          </p>
        </div>
        <Button render={<Link href="/books/nominate" />} variant="outline">
          Nominate a book
        </Button>
      </div>
      <BooksCatalog />
    </main>
  );
}
