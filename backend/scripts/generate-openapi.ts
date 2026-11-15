import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ErroDto } from '../src/common/dto/erro.dto';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sistema Para Denunciar Problemas Urbanos')
    .setDescription('API de denúncias de problemas urbanos')
    .setVersion('1.0')
    .build();

  const documento = SwaggerModule.createDocument(app, config, {
    extraModels: [ErroDto],
  });

  const outputPath = path.join(__dirname, '..', 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(documento, null, 2));
  console.log(`openapi.json gerado em: ${outputPath}`);

  await app.close();
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});