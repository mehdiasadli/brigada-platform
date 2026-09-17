import { headers } from "next/headers";
import { env } from "../env";

export async function readApi(path: string, init?: RequestInit) {
  const cookie = (await headers()).get("cookie");
  return fetch(`${env.NEXT_PUBLIC_APP_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
}

export async function readJson<T>(path: string): Promise<T | null> {
  const response = await readApi(path);
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return (await response.json()) as T;
}
