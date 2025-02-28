import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Import bcrypt để so sánh mật khẩu
import { UserService } from '../modules/users/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Kiểm tra thông tin đăng nhập
  async validateUser(username: string, password: string) {
    const user = await this.userService.findUsername(username);
    if (!user) {
      throw new UnauthorizedException(
        'Tên người dùng hoặc mật khẩu không đúng',
      );
    }

    // 🔐 **So sánh mật khẩu nhập vào với mật khẩu đã mã hóa**
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        'Tên người dùng hoặc mật khẩu không đúng',
      );
    }

    // Trả về user nhưng loại bỏ password
    if (user.isActive === false) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    }
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
