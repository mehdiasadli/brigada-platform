import type { Metadata } from "next";
import { ReadBooksPage } from "./books-page";

export const metadata: Metadata = {
  title: "Reading Club books",
  description: "Add books from OpenLibrary to the club list.",
};

export default function Page() {
  return <ReadBooksPage />;
}
