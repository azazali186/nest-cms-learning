/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SearchPermissionDto {
  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
