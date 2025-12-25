"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const ws_jwt_adapter_1 = require("./gateway/ws-jwt.adapter");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useWebSocketAdapter(new ws_jwt_adapter_1.WsJwtAdapter(app));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Animal Zoom API')
        .setDescription('API documentation for Animal Zoom video conferencing application')
        .setVersion('1.0')
        .addTag('auth', 'Authentication endpoints')
        .addTag('rooms', 'Room management endpoints')
        .addTag('avatars', 'Avatar customization endpoints')
        .addTag('room-configs', 'Room configuration endpoints')
        .addTag('resources', 'Resource management endpoints')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
    }, 'JWT')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
    console.log(`📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map