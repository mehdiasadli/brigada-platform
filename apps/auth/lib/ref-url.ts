import { env } from "../env";

const PRODUCTION_APP_ORIGINS = [
  "https://www.brigada.com",
  "https://admin.brigada.com",
  "https://read.brigada.com",
] as const;

export function allowedRedirectOrigins(): Set<string> {
  return new Set([
    new URL(env.NEXT_PUBLIC_APP_URL).origin,
    "http://localhost:3501",
    ...PRODUCTION_APP_ORIGINS,
  ]);
}

export function isAllowedRefUrl(
  value: string | null | undefined,
): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      allowedRedirectOrigins().has(url.origin)
    );
  } catch {
    return false;
  }
}

export function resolveRefUrl(value: string | null | undefined): string {
  return isAllowedRefUrl(value) ? value : env.NEXT_PUBLIC_APP_URL;
}
