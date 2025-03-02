import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'module-alias/register';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await AppDataSource.initialize(); // Initialize the DataSource
  // Bật CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // ✅ Thêm ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Xóa các field không có trong DTO
      forbidNonWhitelisted: true, // Nếu có field lạ => báo lỗi
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
