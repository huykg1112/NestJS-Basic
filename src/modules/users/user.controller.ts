import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { validate as isUUID } from 'uuid';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
// import { RequirePermission } from 'src/auth/require-permission.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req): Promise<Omit<User, 'password'>> {
    if (!req.user) {
      throw new NotFoundException(`User not found`);
    }
    const userId: string = req.user.id as string;
    // console.log(req.user);
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
    const userId = req.user.id as string;
    return await this.userService.updateUserProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() { oldPassword, newPassword }: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.id as string;
    const currentAccessToken = req.headers.authorization.split(' ')[1];
    return await this.userService.changePassword(
      userId,
      oldPassword,
      newPassword,
      currentAccessToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('assign-role')
  // @RequirePermission('assign_role')
  async assignRoleToUser(
    @Req() req,
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<{ message: string; user: User }> {
    const userId = assignRoleDto.userId || (req.user.id as string);
    const updatedUser = await this.userService.assignRole(
      userId,
      assignRoleDto,
    );
    return { message: 'Phân vai trò thành công', user: updatedUser };
  }

  @UseGuards(JwtAuthGuard)
  @Get('role/get')
  // @RequirePermission('view_role')
  async getUserRole(
    @Req() req,
  ): Promise<{ role: { id: string; name: string } }> {
    const userId = req.user.id as string;
    return this.userService.getUserRole(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/role')
  // @RequirePermission('remove_role')
  async removeUserRole(@Param('id') id: string): Promise<{ message: string }> {
    if (!isUUID(id)) {
      throw new NotFoundException('Định dạng ID không hợp lệ');
    }
    await this.userService.removeRole(id);
    return { message: 'Xóa vai trò thành công' };
  }
}
