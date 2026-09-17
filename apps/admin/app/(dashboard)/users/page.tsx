import type { Metadata } from "next";
import { UsersPage } from "./users-page";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage Brigada users.",
};

export default function Page() {
  return <UsersPage />;
}
