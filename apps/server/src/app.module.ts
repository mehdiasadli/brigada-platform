import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DiscordModule } from "./discord/discord.module";
import { ReadModule } from "./read/read.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, DiscordModule, UsersModule, ReadModule],
})
export class AppModule {}
