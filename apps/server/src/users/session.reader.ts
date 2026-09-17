import { auth } from "@brigada/auth/server";
import { Injectable } from "@nestjs/common";
import type { SessionReader } from "./users.types";

@Injectable()
export class BetterAuthSessionReader implements SessionReader {
  async getSession(cookie: string | undefined) {
    if (!cookie) {
      return null;
    }

    return auth.api.getSession({
      headers: new Headers({ cookie }),
    });
  }
}
