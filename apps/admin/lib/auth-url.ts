import { env } from "../env";

export function authAppUrl(refUrl: string): string {
  const url = new URL(env.NEXT_PUBLIC_AUTH_APP_URL);
  url.searchParams.set("ref_url", refUrl);
  return url.toString();
}
