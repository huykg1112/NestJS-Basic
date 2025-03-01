import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { TokensService } from '../tokens/tokens.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tokenService: TokensService, // Inject TokensService
  ) {}

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy user với username ${username}`,
      );
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id ${id}`);
    }
    return user;
  }
  async saveUser(user: User): Promise<User> {
    // Thêm hàm saveUser dùng trong Athu Service
    return this.userRepository.save(user);
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password, fullName, phone, address } =
      registerUserDto;

    // Kiểm tra username hoặc email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existingUser) {
      throw new BadRequestException('Username hoặc Email đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    if (isNaN(saltRounds)) {
      throw new BadRequestException('BCRYPT_SALT_ROUNDS phải là số');
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      isActive: true, // Giá trị mặc định từ entity
    });

    return this.userRepository.save(newUser);
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    // Cập nhật các trường từ DTO
    const { fullName, email, phone, address, isActive } = updateProfileDto;
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;

    await this.userRepository.save(user); // Sử dụng save thay vì update để cập nhật toàn bộ entity
    return { message: 'Cập nhật thông tin thành công' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    currentAccessToken: string, // Thêm tham số currentAccessToken
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Mã hóa mật khẩu mới
    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    if (isNaN(saltRounds)) {
      throw new BadRequestException('BCRYPT_SALT_ROUNDS phải là số');
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Xóa tất cả token trừ token hiện tại
    const tokenId = user.id;
    await this.tokenService.deleteAllExceptCurrent(tokenId, currentAccessToken);

    return { message: 'Đổi mật khẩu thành công' };
  }
}
