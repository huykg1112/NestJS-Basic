import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với id ${id}`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ name });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với name ${name}`);
    }
    return role;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description } = createRoleDto;
    const exitingRole = await this.findByName(name);
    if (exitingRole) {
      throw new NotFoundException(`Role ${name} đã tồn tại`);
    }
    const role = new Role();
    role.name = name;
    role.description = description;
    return this.roleRepository.save(role);
  }

  async findAll() {
    return this.roleRepository.find();
  }

  async updateRole(id: string, updateRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined)
      role.description = updateRoleDto.description;
    return this.roleRepository.save(role);
  }

  // Bật hoặc tắt trạng thái của role
  async toggleActive(id: string): Promise<Role> {
    const role = await this.findById(id);
    role.isActive = !role.isActive;
    return this.roleRepository.save(role);
  }

  // Xóa role
  async deleteRole(id: string): Promise<Role> {
    const role = await this.findById(id);
    return this.roleRepository.remove(role);
  }
}
