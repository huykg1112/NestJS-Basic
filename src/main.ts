import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // dùng NestFactory để tạo 1 ứng dụng NestJS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
    ], // cho phép các trang web có thể gọi API của ứng dụng
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // cho phép các phương thức HTTP được gọi, Options là phương thức mà trình duyệt gửi đi để kiểm tra xem trang web có thể gọi API không,
    //head là phương thức mà trình duyệt gửi đi để kiểm tra xem API có tồn tại không
    //GET, POST, PUT, PATCH, DELETE là các phương thức mà trình duyệt gửi đi để lấy dữ liệu, thêm dữ liệu, sửa dữ liệu, xóa dữ liệu
    credentials: true, // cho phép gửi cookie, token qua các trang web khác
    allowredHeaders: 'Content-Type, Accept, Authorization', // cho phép các header được gửi đi. Content-Type la header mặc định của REST API, Accept là header mà trình duyệt gửi đi để yêu cầu dữ liệu trả về, Authorization là header chứa token
  }); // cho phép CORS (Cross-Origin Resource Sharing) - cho phép các trang web khác gọi API của ứng dụng
  await app.listen(process.env.PORT ?? 3000); // lắng nghe cổng 3000
}
bootstrap();
