import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateRoleDto } from '../roles/dto/create-role.dto';
import { RolesService } from '../roles/roles.service';
import { TokensService } from '../tokens/tokens.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tokenService: TokensService,
    private readonly roleService: RolesService,
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
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'], // Tải mối quan hệ role
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với id ${id}`);
    }
    return user;
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password, fullName, phone, address, avatar } =
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

    // Tìm hoặc tạo vai trò mặc định "Client"
    let role = await this.roleService.findByName('Client');
    if (!role) {
      const createRoleDto: CreateRoleDto = {
        name: 'Client',
        description: 'Vai trò mặc định cho khách hàng',
      };
      role = await this.roleService.createRole(createRoleDto);
    }

    // Tạo user mới và gán vai trò "Client"
    const newUser = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      avatar,
      isActive: true,
      role, // Gán role trực tiếp
    });

    // Lưu user mà không cần lo lắng về phía ngược (Role.users)
    return this.userRepository.save(newUser);
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    const { fullName, email, phone, address, isActive, avatar } =
      updateProfileDto;
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (isActive !== undefined) user.isActive = isActive;
    if (avatar !== undefined) user.avatar = avatar;

    await this.userRepository.save(user);
    return { message: 'Cập nhật thông tin thành công' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    currentAccessToken: string,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    const saltRounds = Number(
      this.configService.get<number>('BCRYPT_SALT_ROUNDS'),
    );
    if (isNaN(saltRounds)) {
      throw new BadRequestException('BCRYPT_SALT_ROUNDS phải là số');
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.tokenService.deleteAllExceptCurrent(user.id, currentAccessToken);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async assignRole(
    userId: string,
    assignRoleDto: AssignRoleDto,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `Người dùng với ID ${userId} không được tìm thấy`,
      );
    }

    const role = await this.roleService.findById(assignRoleDto.roleId);
    if (!role || !role.isActive) {
      throw new BadRequestException(
        `Vai trò với ID ${assignRoleDto.roleId} không hợp lệ hoặc đã bị khóa`,
      );
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async getUserRole(
    userId: string,
  ): Promise<{ role: { id: string; name: string } }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'], // Tải mối quan hệ role
    });
    if (!user) {
      throw new NotFoundException(
        `Người dùng với ID ${userId} không được tìm thấy`,
      );
    }
    return { role: { id: user.role.id, name: user.role.name } };
  }

  async removeRole(userId: string): Promise<User> {
    const user = await this.findById(userId);
    const roleClient = await this.roleService.findByName('Client');
    if (!user) {
      throw new NotFoundException(
        `Người dùng với ID ${userId} không được tìm thấy`,
      );
    }

    user.role = roleClient;
    return this.userRepository.save(user);
  }
}
