import { createBrigadaAuthClient } from "@brigada/auth/client";
import { env } from "../env";

export const authClient = createBrigadaAuthClient(env.NEXT_PUBLIC_AUTH_APP_URL);
