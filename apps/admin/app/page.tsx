import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description: "Brigada admin overview.",
};

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p>Admin</p>
    </main>
  );
}
