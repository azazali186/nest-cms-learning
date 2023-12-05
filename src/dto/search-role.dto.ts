import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { SearchBaseDto } from './search-base-dto';

export class SearchRoleDto extends SearchBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  name: string;
}
