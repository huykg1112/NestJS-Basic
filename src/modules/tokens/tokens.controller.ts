import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get(':userId')
  async getTokenByUserId(@Param('userId') userId: string): Promise<any> {
    const token = await this.tokensService.findAllByUserId(userId);
    if (!token) {
      throw new NotFoundException(
        `Không tìm thấy token cho user với ID ${userId}`,
      );
    }
    return token;
  }
}
