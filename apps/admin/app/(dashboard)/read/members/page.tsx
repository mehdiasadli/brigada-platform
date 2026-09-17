import type { Metadata } from "next";
import { ReadMembersPage } from "./members-page";

export const metadata: Metadata = {
  title: "Reading Club members",
  description: "Grant or revoke Read membership.",
};

export default function Page() {
  return <ReadMembersPage />;
}
