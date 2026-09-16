import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";
import * as schema from "./schema";

export function createDb(url = env.DATABASE_URL) {
  return drizzle({ client: neon(url), schema });
}

export const db = createDb();
