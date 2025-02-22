import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async findUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async findId(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password } = registerUserDto;
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    if (isNaN(saltRounds)) {
      throw new BadRequestException('BCRYPT_SALT_ROUNDS must be a number');
    }
    const salt = await bcrypt.genSalt(saltRounds);
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username hoặc Email đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
    });

    return this.userRepository.save(newUser);
  }
  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string }> {
    const user = await this.findId(userId);
    const { email, isActive } = updateProfileDto;
    if (email) {
      user.email = email;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    await this.userRepository.update(userId, updateProfileDto);
    return { message: 'Cập nhật thông tin thành công' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.findId(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    if (isNaN(saltRounds)) {
      throw new BadRequestException('BCRYPT_SALT_ROUNDS must be a number');
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.userRepository.update(userId, { password: hashedPassword });
    return { message: 'Đổi mật khẩu thành công' };
  }
}
