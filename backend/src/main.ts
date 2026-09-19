import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Sistema Para Denunciar Problemas Urbanos')
    .setDescription('API de denúncias de problemas urbanos')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
