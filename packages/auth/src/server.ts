import { auth } from "./auth";

export { toNodeHandler } from "better-auth/node";
export { env } from "./env";
export { auth };
export type Session = typeof auth.$Infer.Session;
