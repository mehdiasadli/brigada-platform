import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInCard } from "../components/sign-in-card";
import { env } from "../env";
import { isAllowedRefUrl } from "../lib/ref-url";
import { loadAuthSearchParams } from "../lib/search-params";
import { getServerSession } from "../lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Brigada with Discord.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sessionPromise = getServerSession();
  const { ref_url: refUrl } = await loadAuthSearchParams(searchParams);

  if (!isAllowedRefUrl(refUrl)) {
    redirect(`/?ref_url=${encodeURIComponent(env.NEXT_PUBLIC_APP_URL)}`);
  }

  const session = await sessionPromise;
  if (session) {
    redirect(refUrl);
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <SignInCard callbackURL={refUrl} />
    </main>
  );
}
