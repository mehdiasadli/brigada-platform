import { forbidden, redirect } from "next/navigation";
import { env } from "../env";
import { authAppUrl } from "./auth-url";
import { getServerSession } from "./session";

export async function requireAdmin() {
  const session = await getServerSession();

  if (!session) {
    redirect(authAppUrl(env.NEXT_PUBLIC_APP_URL));
  }

  if (session.user.role !== "admin") {
    forbidden();
  }

  return session;
}
