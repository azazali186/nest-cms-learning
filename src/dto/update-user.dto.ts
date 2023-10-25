import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  IsNotEmpty,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  roleIds?: string[];
}
