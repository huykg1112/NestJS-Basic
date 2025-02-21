import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Đăng ký repository
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Xuất UserService nếu cần dùng ở module khác
})
export class UserModule {}
