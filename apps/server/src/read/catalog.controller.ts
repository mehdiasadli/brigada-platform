import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { parseCatalogQuery, parseSearchBooksQuery } from "./books.query";
import { ReadBooksService } from "./books.service";
import { ReadMembersService } from "./members.service";
import { ReadMemberGuard } from "./read-member.guard";
import { parseReadSessionId } from "./sessions.query";
import { ReadSessionsService } from "./sessions.service";

@Controller("api/read")
@UseGuards(ReadMemberGuard)
export class ReadCatalogController {
  constructor(
    @Inject(ReadBooksService) private readonly books: ReadBooksService,
    @Inject(ReadMembersService) private readonly members: ReadMembersService,
    @Inject(ReadSessionsService) private readonly sessions: ReadSessionsService,
  ) {}

  @Get("sessions")
  listSessions() {
    return this.sessions.listForMembers();
  }

  @Get("sessions/:id")
  getSession(@Param("id") id: string) {
    return this.sessions.getForMember(parseReadSessionId(id));
  }

  @Get("books/search")
  searchBooks(@Query() query: Record<string, string | undefined>) {
    return this.books.search(parseSearchBooksQuery(query).q);
  }

  @Get("books")
  listBooks(@Query() query: Record<string, string | undefined>) {
    return this.books.listCatalog(parseCatalogQuery(query));
  }

  @Get("books/:slug")
  getBook(
    @Param("slug") slug: string,
    @Req() request: Request & { userId?: string },
  ) {
    return this.books.getBySlug(slug, request.userId);
  }

  @Get("members")
  listMembers() {
    return this.members.listDirectory();
  }

  @Get("members/:username")
  getMember(@Param("username") username: string) {
    return this.members.getProfile(username);
  }
}
