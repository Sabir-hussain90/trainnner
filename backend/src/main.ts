import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.init();
}

bootstrap();

// Only listen if running locally (Vercel sets process.env.VERCEL automatically)
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 4000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API running on port ${port}`);
  });
}

export default server;