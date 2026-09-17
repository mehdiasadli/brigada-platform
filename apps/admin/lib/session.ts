import type { Session } from "@brigada/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { env } from "../env";

export const getServerSession = cache(async (): Promise<Session | null> => {
  const cookie = (await headers()).get("cookie");
  if (!cookie) {
    return null;
  }

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`,
      {
        headers: { cookie },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Session | null;
    if (!data?.session) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
});
