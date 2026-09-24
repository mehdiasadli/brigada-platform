import type { Metadata } from "next";
import { BooksCatalog } from "../../components/books-catalog";
import { NominateBookDialog } from "../../components/nominate-dialog";
import { requireReadMember } from "../../lib/require-member";

export const metadata: Metadata = {
  title: "Books",
  description: "Books on the Brigada reading list.",
};

export default async function Page() {
  await requireReadMember();

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
            Books
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Books waiting to be chosen, being read, or finished.
          </p>
        </div>
        <NominateBookDialog />
      </div>
      <BooksCatalog />
    </main>
  );
}
