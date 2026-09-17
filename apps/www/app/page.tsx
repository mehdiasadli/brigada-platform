import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Brigada home.",
};

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p>Brigada</p>
    </main>
  );
}
