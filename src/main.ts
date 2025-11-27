import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://uea.lexis.com.ec',
      'http://localhost:3000',
      'http://localhost:3002',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
