import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ErroDto } from './common/dto/erro.dto';
import * as express from 'express';
import * as path from 'path';

patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  // Serve arquivos de anexo enviados (fotos capturadas/selecionadas).
  const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  const config = new DocumentBuilder()
    .setTitle('Sistema Para Denunciar Problemas Urbanos')
    .setDescription('API de denúncias de problemas urbanos')
    .setVersion('1.0')
    .build();
  const documento = SwaggerModule.createDocument(app, config, {
    extraModels: [ErroDto],
  });
  SwaggerModule.setup('api/docs', app, documento);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
