import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../modules/user/user.entity';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // Khai báo UserService
    private readonly jwtService: JwtService, // Khai báo JwtService
  ) {} // khởi tạo JwtService - đây là phương thức giúp tạo và giải mã token

  // Kiểm tra thông tin đăng nhập
  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findUsername(username);

    if (user && password === user.password) {
      const { password: userPassword, ...result } = user;
      return result as User;
    }
    throw new UnauthorizedException('The password is not correct');
  }

  // hàm tạo token
  login(user: Omit<User, 'password'>) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
