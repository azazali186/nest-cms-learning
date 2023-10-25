/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SearchPermissionDto {
  
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
