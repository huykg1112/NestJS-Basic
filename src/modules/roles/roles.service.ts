import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { RolePermissionService } from '../role_permissions/role_permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
    private readonly RolePermissionService: RolePermissionService,
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
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new NotFoundException(`Role ${name} đã tồn tại`);
    }
    const role = new Role();
    role.name = name;
    role.description = description;
    const savedRole = await this.roleRepository.save(role);

    if (name.toLowerCase() === 'admin') {
      const allPermissions = await this.permissionsService.findAll();
      console.log('All permissions:', allPermissions);
      for (const permission of allPermissions) {
        console.log(
          `Adding permission ${permission.id} to role ${savedRole.id}`,
        );
        await this.RolePermissionService.addPermissionToRole(
          savedRole.id,
          permission.id,
        );
      }
    }
    return savedRole;
  }

  async findAll() {
    return this.roleRepository.find();
  }

  async updateRole(id: string, updateRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với id ${id}`);
    }
    if (updateRoleDto.name !== undefined) role.name = updateRoleDto.name;
    if (updateRoleDto.description !== undefined)
      role.description = updateRoleDto.description;
    return this.roleRepository.save(role);
  }

  // Bật hoặc tắt trạng thái của Role
  async toggleActive(id: string): Promise<Role> {
    const role = await this.findById(id);
    role.isActive = !role.isActive;
    return this.roleRepository.save(role);
  }

  // Xóa Role
  async deleteRole(id: string): Promise<Role> {
    const role = await this.findById(id);
    return this.roleRepository.remove(role);
  }

  // Lấy tất cả RolePermission của Role
  async getRolePermissions(id: string): Promise<{ role: Role }> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với id ${id}`);
    }
    return { role };
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role với id ${roleId}`);
    }
    const permission = await this.permissionsService.findById(permissionId);
    if (!permission) {
      throw new NotFoundException(
        `Không tìm thấy permission với id ${permissionId}`,
      );
    }
    await this.RolePermissionService.addPermissionToRole(roleId, permissionId);
    return role;
  }
}
