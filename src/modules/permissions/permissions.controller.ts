import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Lấy tất cả Permission
  @Get('all/')
  async findAll() {
    return this.permissionsService.findAll();
  }

  //lấy Permission theo ID
  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  //lấy Permission theo Name
  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    return this.permissionsService.findByName(name);
  }

  // Tao Permission
  @Post('create')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  // Cập nhật Permission
  @Put('update/:id')
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  // Bật hoặc tắt trạng thái của Permission
  @Patch('toggle-active/:id')
  async toggleActive(@Param('id') id: string): Promise<{ message: string }> {
    const permission = await this.permissionsService.toggleActive(id);
    if (permission.isActive) {
      return { message: 'Permission đã được kích hoạt' };
    } else {
      return { message: 'Permission đã được tắt' };
    }
  }

  // Xóa Permission
  @Delete('delete/:id')
  async deletePermission(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.permissionsService.deletePermission(id);
    return { message: 'Xóa Permission thành công' };
  }
}
