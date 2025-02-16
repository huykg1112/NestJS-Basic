import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lấy token từ header của request
      ignoreExpiration: false, // Không bỏ qua thời gian hết hạn của token
      secretOrKey: 'SECRET_KEY', // Thay thế 'SECRET_KEY' bằng khóa bí mật của bạn
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username }; // Trả về thông tin user từ payload
  }
}
