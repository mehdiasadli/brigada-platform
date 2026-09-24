import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { parseNominateBook } from "./nominations.query";
import { ReadNominationsService } from "./nominations.service";
import { ReadMemberGuard } from "./read-member.guard";
import { parseProgress, parseReview } from "./sessions.query";
import { ReadSessionsService } from "./sessions.service";

@Controller("api/read/me")
@UseGuards(ReadMemberGuard)
export class ReadMeController {
  constructor(
    @Inject(ReadSessionsService) private readonly sessions: ReadSessionsService,
    @Inject(ReadNominationsService)
    private readonly nominations: ReadNominationsService,
  ) {}

  @Get("session")
  async current(@Req() request: Request & { userId?: string }) {
    const current = await this.sessions.currentForMember(
      requireUserId(request),
    );
    if (!current) {
      throw new NotFoundException("No open session");
    }

    return current;
  }

  @Patch("progress")
  setProgress(
    @Req() request: Request & { userId?: string },
    @Body() body: unknown,
  ) {
    return this.sessions.setProgress(
      requireUserId(request),
      parseProgress(body),
    );
  }

  @Post("nominations")
  nominate(
    @Req() request: Request & { userId?: string },
    @Body() body: unknown,
  ) {
    return this.nominations.nominate(
      requireUserId(request),
      parseNominateBook(body),
    );
  }

  @Post("reviews")
  createReview(
    @Req() request: Request & { userId?: string },
    @Body() body: unknown,
  ) {
    return this.sessions.createReview(
      requireUserId(request),
      parseReview(body),
    );
  }

  @Patch("reviews")
  updateReview(
    @Req() request: Request & { userId?: string },
    @Body() body: unknown,
  ) {
    return this.sessions.updateReview(
      requireUserId(request),
      parseReview(body),
    );
  }
}

function requireUserId(request: Request & { userId?: string }) {
  if (!request.userId) {
    throw new Error("Missing user id");
  }

  return request.userId;
}
