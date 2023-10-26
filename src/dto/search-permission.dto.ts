/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SearchPermissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
