import type { Metadata } from "next";
import { ReadSessionsPage } from "./sessions-page";

export const metadata: Metadata = {
  title: "Reading Club sessions",
  description: "Run a reading session and resolve the Discord vote.",
};

export default function Page() {
  return <ReadSessionsPage />;
}
