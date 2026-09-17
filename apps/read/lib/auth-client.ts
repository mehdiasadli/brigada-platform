import { createBrigadaAuthClient } from "@brigada/auth/client";
import { env } from "../env";

export const authClient = createBrigadaAuthClient(
  env.NEXT_PUBLIC_BETTER_AUTH_URL,
);
