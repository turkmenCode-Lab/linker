import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import type { Request, Response } from 'express';

const expressApp = express();
let isReady = false;

async function bootstrap() {
  if (isReady) return expressApp;
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.enableCors();
  await app.init();
  isReady = true;
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  app(req, res);
}
