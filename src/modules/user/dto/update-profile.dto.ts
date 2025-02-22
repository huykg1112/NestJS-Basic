import { IsBoolean, IsOptional, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, { message: 'Email is invalid' })
  email?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive: boolean;
}
