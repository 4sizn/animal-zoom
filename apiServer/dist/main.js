import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { WsJwtAdapter } from './gateway/ws-jwt.adapter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useWebSocketAdapter(new WsJwtAdapter(app));
    const config = new DocumentBuilder()
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
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
    console.log(`📚 API Documentation: http://localhost:${process.env.PORT ?? 3000}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map