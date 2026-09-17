import { forbidden, redirect } from "next/navigation";
import { env } from "../env";
import { authAppUrl } from "./auth-url";
import { readApi } from "./read-api";
import { getServerSession } from "./session";

export async function requireReadMember() {
  const session = await getServerSession();

  if (!session) {
    redirect(authAppUrl(env.NEXT_PUBLIC_APP_URL));
  }

  const current = await readApi("/api/read/me/session");
  if (current.status === 403) {
    forbidden();
  }

  return session;
}
