import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

interface User {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() user: User) {
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // sử dụng AuthGuard với chiến lược jwt để bảo vệ route /profile
  getProfile(@Request() req) {
    return req.user; // trả về thông tin user
  }
}
