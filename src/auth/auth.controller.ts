import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    try {
      const user = await this.authService.validateUser(
        body.username,
        body.password,
      );
      return this.authService.login(user);
    } catch (error) {
      throw new HttpException(
        'The password or username is not correct!',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
