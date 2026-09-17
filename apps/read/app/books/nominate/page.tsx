import type { Metadata } from "next";
import { NominateForm } from "../../../components/nominate-form";
import { requireReadMember } from "../../../lib/require-member";

export const metadata: Metadata = {
  title: "Nominate a book",
  description: "Propose a title for the Brigada reading list.",
};

export default async function Page() {
  await requireReadMember();

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Nominate a book
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Search Open Library. An admin still picks the slate for the next vote.
        </p>
      </div>
      <NominateForm />
    </main>
  );
}
