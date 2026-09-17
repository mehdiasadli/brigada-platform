import { headers } from "next/headers";
import { env } from "../env";
import { parseApiErrorMessage } from "./api-error";

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

export function parseReadJson<T>(status: number, body: string): T | null {
  if (status === 404 || status === 204) {
    return null;
  }

  if (status < 200 || status >= 300) {
    throw new Error(parseApiErrorMessage(body, "Failed to load"));
  }

  if (body.trim() === "") {
    return null;
  }

  return JSON.parse(body) as T;
}

export async function readJson<T>(path: string): Promise<T | null> {
  const response = await readApi(path);
  return parseReadJson<T>(response.status, await response.text());
}
