import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { DiscordModule } from "./discord/discord.module";

@Module({
  imports: [AuthModule, DiscordModule],
})
export class AppModule {}
