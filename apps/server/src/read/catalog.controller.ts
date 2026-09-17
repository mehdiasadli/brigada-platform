import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { ReadBooksService } from "./books.service";
import { ReadMembersService } from "./members.service";
import { ReadMemberGuard } from "./read-member.guard";

@Controller("api/read")
@UseGuards(ReadMemberGuard)
export class ReadCatalogController {
  constructor(
    @Inject(ReadBooksService) private readonly books: ReadBooksService,
    @Inject(ReadMembersService) private readonly members: ReadMembersService,
  ) {}

  @Get("books")
  listBooks() {
    return this.books.listVisible();
  }

  @Get("books/:slug")
  getBook(@Param("slug") slug: string) {
    return this.books.getBySlug(slug);
  }

  @Get("members/:username")
  getMember(@Param("username") username: string) {
    return this.members.getProfile(username);
  }
}
