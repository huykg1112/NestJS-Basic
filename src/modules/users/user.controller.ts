import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { console } from 'inspector';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { validate as isUUID } from 'uuid';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<Omit<User, 'password'>> {
    if (!req.user) {
      throw new NotFoundException(`User not found`);
    }
    const userId: string = req.user.sub as string; // Lấy user ID từ JWT token
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Invalid ID format`);
    }
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.userService.register(registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Req() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string }> {
    // Loại bỏ password và id
    const userId = req.user.sub as string;
    return await this.userService.updateUserProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.sub as string;
    const currentAccessToken = req.headers.authorization.split(' ')[1]; // Lấy token từ header
    return await this.userService.changePassword(
      userId,
      oldPassword,
      newPassword,
      currentAccessToken,
    );
  }
}
