import "reflect-metadata";
import { expect, mock, test } from "bun:test";
import { Test } from "@nestjs/testing";
import type { Request, Response } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

test("forwards the request to the auth service", async () => {
  const handle = mock(() => Promise.resolve());
  const module = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: { handle } }],
  }).compile();

  const controller = module.get(AuthController);
  const request = { url: "/api/auth/ok" } as Request;
  const response = {} as Response;

  await controller.handle(request, response);

  expect(handle).toHaveBeenCalledWith(request, response);
});
