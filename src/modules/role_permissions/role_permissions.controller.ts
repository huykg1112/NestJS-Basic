import { Controller, Delete, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from './entities/role_permission.entity';
import { RolePermissionService } from './role_permissions.service';

@Controller('roles/:roleId/permissions')
export class RolePermissionsController {
  constructor(
    @InjectRepository(RolePermission)
    private readonly RolePermissionService: RolePermissionService,
  ) {}

  @Post(':permissionId')
  async addPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.RolePermissionService.addPermissionToRole(roleId, permissionId);
  }

  @Delete(':permissionId')
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.RolePermissionService.removePermissionFromRole(
      roleId,
      permissionId,
    );
    return { message: 'Permission removed from role successfully' };
  }
}
