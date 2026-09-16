import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  inferAdditionalFields,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import type { auth } from "./auth";
import { ac, roles } from "./permissions";

export function createBrigadaAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [
      usernameClient({ displayUsername: false }),
      twoFactorClient(),
      passkeyClient(),
      adminClient({ ac, roles }),
      inferAdditionalFields<typeof auth>(),
    ],
  });
}
