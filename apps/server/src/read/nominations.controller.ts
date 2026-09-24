import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../users/admin.guard";
import { parseNominationId, parseNominationStatus } from "./nominations.query";
import { ReadNominationsService } from "./nominations.service";

@Controller("api/admin/read/nominations")
@UseGuards(AdminGuard)
export class ReadNominationsController {
  constructor(
    @Inject(ReadNominationsService)
    private readonly nominations: ReadNominationsService,
  ) {}

  @Get()
  list() {
    return this.nominations.listOpen();
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.nominations.setStatus(
      parseNominationId(id),
      parseNominationStatus(body),
    );
  }
}
