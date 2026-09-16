import { All, Controller, Inject, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

@Controller("api/auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @All("{*path}")
  handle(@Req() request: Request, @Res() response: Response) {
    return this.authService.handle(request, response);
  }
}
