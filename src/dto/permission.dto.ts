import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  guard: string;

  @IsString()
  @IsNotEmpty()
  service: string;
}
