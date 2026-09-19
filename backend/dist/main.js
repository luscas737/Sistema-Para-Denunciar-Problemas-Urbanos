"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new nestjs_zod_1.ZodValidationPipe());
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Sistema Para Denunciar Problemas Urbanos')
        .setDescription('API de denúncias de problemas urbanos')
        .setVersion('1.0')
        .build();
    swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    await app.listen(process.env.PORT || 3001);
}
bootstrap();
//# sourceMappingURL=main.js.map