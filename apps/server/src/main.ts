import "reflect-metadata";
import { env as authEnv } from "@brigada/auth/server";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { json, type NextFunction, type Request, type Response } from "express";
import { AppModule } from "./app.module";
import { env } from "./env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.originalUrl.startsWith("/api/auth")) {
      next();
      return;
    }

    json()(request, response, next);
  });

  app.enableShutdownHooks();
  app.enableCors({
    origin: authEnv.AUTH_TRUSTED_ORIGINS,
    credentials: true,
  });

  await app.listen(env.PORT);
  Logger.log(`Listening on ${await app.getUrl()}`, "Bootstrap");
}

void bootstrap();
