import type { Request, Response } from "express";

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");

export type AuthHandler = {
  handle(request: Request, response: Response): unknown;
};
