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
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  //Lấy Role theo ID
  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }
  //Lấy Role theo Name
  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    return this.rolesService.findByName(name);
  }
  //Lấy tất cả Role
  @Get('all')
  async findAll() {
    return this.rolesService.findAll();
  }

  //Tạo Role
  @Post('create')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  //Cập nhật Role
  @Put('update/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  //Bật hoặc tắt trạng thái của Role
  @Patch('toggle-active/:id')
  async toggleActive(@Param('id') id: string) {
    return this.rolesService.toggleActive(id);
  }

  //Xóa Role

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}
