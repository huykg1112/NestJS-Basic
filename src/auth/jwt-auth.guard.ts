import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../modules/tokens/tokens.service';
import { UserService } from '../modules/users/user.service';

interface JwtPayload {
  sub: string; // ID của user
  username: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokensService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string;

    console.log('sadasdas ád', authHeader);
    // Kiểm tra header Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token không hợp lệ hoặc thiếu');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Xác minh JWT (tương tự JwtStrategy)
      const secret =
        this.configService.get<string>('JWT_SECRET') ?? 'mysecretkey';
      const decoded: JwtPayload = this.jwtService.verify(token, { secret });

      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Kiểm tra user (tương tự validate trong JwtStrategy)
      const user = await this.userService.findById(decoded.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException(
          'Người dùng không tồn tại hoặc bị khóa',
        );
      }

      // Kiểm tra token trong bảng Token (tương tự JwtAuthGuard cũ)
      const storedToken = await this.tokenService.findByAccessToken(token);
      if (
        !storedToken ||
        storedToken.accessToken !== token ||
        (storedToken.accessTokenExpiresAt &&
          storedToken.accessTokenExpiresAt < new Date())
      ) {
        throw new UnauthorizedException(
          'Token không hợp lệ hoặc đã bị vô hiệu hóa',
        );
      }

      // Gán thông tin user vào request (loại bỏ password)
      const { password, ...result } = user;
      request.user = result;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
