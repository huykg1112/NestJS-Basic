import { TokensService } from '@modules/tokens/tokens.service'; // Thêm TokenService
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { UserService } from '../modules/users/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokensService, // Inject TokenService
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findByUsername(username);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException(
        'Tên người dùng hoặc mật khẩu không đúng',
      );
    if (!user.isActive)
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
    const { password: _, ...result } = user;
    return result;
  }

  async hashRefreshToken(token: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
  }

  async compareRefreshToken(token: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(token, hashed);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    const payload = { username: user.username, sub: user.id };

    // Lấy danh sách token hiện tại của user
    const existingTokens = await this.tokenService.findAllByUserId(user.id);
    const currentDate = new Date();
    for (const token of existingTokens) {
      if (
        token.refreshTokenExpiresAt &&
        token.refreshTokenExpiresAt < currentDate
      ) {
        await this.tokenService.deleteByAccessToken(token.id);
      }
    }

    // Tạo access token và refresh token mới
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);

    // Lưu token vào bảng Token
    await this.tokenService.createForUser(
      user.id,
      accessToken,
      hashedRefreshToken,
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string }> {
    const { refreshToken } = refreshTokenDto;
    const payload = this.jwtService.verify(refreshToken) as {
      sub: string;
      username: string;
    };
    const tokens = await this.tokenService.findAllByUserId(payload.sub);
    const token = tokens.find((t) => t.refreshToken === refreshToken);

    if (
      !token ||
      !token.refreshTokenExpiresAt ||
      token.refreshTokenExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    const isValid = await this.compareRefreshToken(
      refreshToken,
      token.refreshToken || '',
    );
    if (!isValid) throw new UnauthorizedException('Refresh token không hợp lệ');

    const newPayload = { username: payload.username, sub: payload.sub };
    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: '1h',
    });

    // Cập nhật access token mới
    token.accessToken = newAccessToken;
    token.accessTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
    await this.tokenService.save(token);

    return { access_token: newAccessToken };
  }

  async logout(accessToken: string): Promise<void> {
    // Xóa token cụ thể dựa trên accessToken
    await this.tokenService.deleteByAccessToken(accessToken);
  }
}
