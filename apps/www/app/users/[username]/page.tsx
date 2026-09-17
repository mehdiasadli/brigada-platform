import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@brigada/ui/components/card";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoutButton } from "../../../components/logout-button";
import { env } from "../../../env";
import { authAppUrl } from "../../../lib/auth-url";
import { getServerSession } from "../../../lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `@${username}`,
    description: `${username} on Brigada.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const sessionPromise = getServerSession();
  const { username } = await params;
  const session = await sessionPromise;
  const profileUrl = `${env.NEXT_PUBLIC_APP_URL}/users/${username}`;

  if (!session) {
    redirect(authAppUrl(profileUrl));
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>@{username}</CardTitle>
          <CardDescription>Profile</CardDescription>
        </CardHeader>
        <CardFooter>
          <LogoutButton href={authAppUrl(profileUrl)} />
        </CardFooter>
      </Card>
    </main>
  );
}
