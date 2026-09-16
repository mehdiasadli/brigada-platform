import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { Test } from "@nestjs/testing";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AUTH_REPOSITORY } from "./auth-handler";

test("forwards the request to the auth repository", async () => {
  const handle = mock(() => Promise.resolve());
  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: AUTH_REPOSITORY, useValue: { handle } },
    ],
  }).compile();

  const service = module.get(AuthService);
  const request = { url: "/api/auth/ok" } as Request;
  const response = {} as Response;

  await service.handle(request, response);

  expect(handle).toHaveBeenCalledWith(request, response);
});
