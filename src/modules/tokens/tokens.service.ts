import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  // Tìm tất cả token của user
  async findAllByUserId(userId: string): Promise<Token[]> {
    return this.tokenRepository.find({ where: { user: { id: userId } } });
  }

  // Tìm token cụ thể bằng accessToken
  async findByAccessToken(accessToken: string): Promise<Token | null> {
    return this.tokenRepository.findOne({ where: { accessToken } });
  }

  async save(token: Token): Promise<Token> {
    return this.tokenRepository.save(token);
  }

  // Xóa token cụ thể bằng accessToken
  async deleteByAccessToken(accessToken: string): Promise<void> {
    const token = await this.findByAccessToken(accessToken);
    if (token) {
      await this.tokenRepository.delete(token.id);
    }
  }

  // Xóa tất cả token của user trừ token hiện tại
  // Xóa tất cả token của user trừ token hiện tại
  async deleteAllExceptCurrent(
    userId: string,
    currentAccessToken: string,
  ): Promise<void> {
    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .from(Token)
      .where('"userId" = :userId AND "accessToken" != :currentAccessToken', {
        userId,
        currentAccessToken,
      })
      .execute();
  }

  async createForUser(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<Token> {
    const token = this.tokenRepository.create({
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 giờ
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
      user: { id: userId },
    });
    return this.tokenRepository.save(token);
  }
}
