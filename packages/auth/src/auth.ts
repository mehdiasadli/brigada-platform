import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { db } from "@brigada/db";
import * as schema from "@brigada/db/schema";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { twoFactor } from "better-auth/plugins/two-factor";
import { username } from "better-auth/plugins/username";
import { env } from "./env";
import { ac, roles } from "./permissions";
import {
  isBrigadaUsername,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  userFieldsFromDiscordProfile,
} from "./username";

export const auth = betterAuth({
  appName: "Brigada",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      mapProfileToUser: (profile) => userFieldsFromDiscordProfile(profile),
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["discord"],
    },
  },
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
  plugins: [
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
      displayUsername: false,
      usernameValidator: isBrigadaUsername,
      validationOrder: {
        username: "post-normalization",
      },
    }),
    twoFactor({
      allowPasswordless: true,
    }),
    passkey(),
    admin({
      ac,
      roles,
      defaultRole: "user",
    }),
    openAPI(),
  ],
  advanced: {
    database: {
      generateId: "uuid",
      joins: true,
    },
    ...(env.AUTH_COOKIE_DOMAIN
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: env.AUTH_COOKIE_DOMAIN,
          },
        }
      : {}),
  },
});
