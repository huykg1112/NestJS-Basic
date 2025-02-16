import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// interface User {
//   username: string;
//   password: string;
// }

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {} // khởi tạo JwtService - đây là phương thức giúp tạo và giải mã token

  //hàm tạo token
  login(user: any) {
    const payload = { username: user.username, sub: user.userId }; // tạo payload chứa thông tin user - payload là nội dung của token (vd: username, userId, role, ...)
    return {
      access_token: this.jwtService.sign(payload), // tạo token từ payload
    };
  }
}

// JwtService → Dùng để tạo token.
// login(user) → Nhận thông tin user, tạo token với thông tin username và id.
// this.jwtService.sign(payload) → Tạo JWT token từ dữ liệu user.
