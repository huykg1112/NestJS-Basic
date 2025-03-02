import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtAuthGuard } from '@root/src/auth/jwt-auth.guard';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @UseGuards(JwtAuthGuard)
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
