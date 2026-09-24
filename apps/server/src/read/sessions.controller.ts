import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../users/admin.guard";
import { parseReadMemberUserId } from "./members.query";
import {
  parseParticipation,
  parseProgress,
  parseReadSessionId,
  parseResolveVote,
  parseSlate,
} from "./sessions.query";
import { ReadSessionsService } from "./sessions.service";

@Controller("api/admin/read/sessions")
@UseGuards(AdminGuard)
export class ReadSessionsController {
  constructor(
    @Inject(ReadSessionsService) private readonly sessions: ReadSessionsService,
  ) {}

  @Get()
  list() {
    return this.sessions.list();
  }

  @Get("suggest")
  suggest() {
    return this.sessions.suggest();
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.sessions.getById(parseReadSessionId(id));
  }

  @Post()
  create() {
    return this.sessions.create();
  }

  @Put(":id/slate")
  setSlate(@Param("id") id: string, @Body() body: unknown) {
    return this.sessions.setSlate(
      parseReadSessionId(id),
      parseSlate(body).bookIds,
    );
  }

  @Post(":id/start")
  start(@Param("id") id: string) {
    return this.sessions.startVoting(parseReadSessionId(id));
  }

  @Post(":id/resolve")
  resolve(@Param("id") id: string, @Body() body: unknown) {
    return this.sessions.resolveVoting(
      parseReadSessionId(id),
      parseResolveVote(body),
    );
  }

  @Post(":id/cancel")
  cancel(@Param("id") id: string) {
    return this.sessions.cancel(parseReadSessionId(id));
  }

  @Post(":id/complete")
  complete(@Param("id") id: string) {
    return this.sessions.complete(parseReadSessionId(id));
  }

  @Delete(":id/readers/:userId")
  removeReader(@Param("id") id: string, @Param("userId") userId: string) {
    return this.sessions.removeReader(
      parseReadSessionId(id),
      parseReadMemberUserId(userId),
    );
  }

  @Patch(":id/readers/:userId/participation")
  setParticipation(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Body() body: unknown,
  ) {
    return this.sessions.setParticipation(
      parseReadSessionId(id),
      parseReadMemberUserId(userId),
      parseParticipation(body),
    );
  }

  @Patch(":id/readers/:userId/progress")
  setReaderProgress(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Body() body: unknown,
  ) {
    return this.sessions.setReaderProgress(
      parseReadSessionId(id),
      parseReadMemberUserId(userId),
      parseProgress(body),
    );
  }
}
