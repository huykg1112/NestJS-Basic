import { Module } from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';
import { RolePermissionsController } from './role_permissions.controller';
import { RolePermission } from './entities/role_permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolePermission]), //
  ],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
})
export class RolePermissionsModule {}
