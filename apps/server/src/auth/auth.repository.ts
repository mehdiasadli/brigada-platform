import { auth, toNodeHandler } from "@brigada/auth/server";
import { Injectable } from "@nestjs/common";
import type { Request, Response } from "express";
import type { AuthHandler } from "./auth-handler";

@Injectable()
export class AuthRepository implements AuthHandler {
  private readonly handler = toNodeHandler(auth);

  handle(request: Request, response: Response) {
    return this.handler(request, response);
  }
}
