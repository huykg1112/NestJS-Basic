import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { RefreshTokenDto } from '../modules/users/dto/refresh-token.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Đăng nhập
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Refresh token
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string }> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  // Đăng xuất
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req): Promise<{ message: string }> {
    const accessToken = req.headers.authorization.split(' ')[1]; // Lấy token từ header
    await this.authService.logout(accessToken); // Truyền accessToken thay vì userId
    return { message: 'Đăng xuất thành công' };
  }
}
