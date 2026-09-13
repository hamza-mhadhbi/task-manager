import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Task manager example')
    .setDescription('The Task Manager API description')
    .setVersion('1.0')
    // .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('explorer', app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
