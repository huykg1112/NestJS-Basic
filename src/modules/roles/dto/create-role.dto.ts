import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description: string;
}
