import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIP, IsOptional } from 'class-validator';
import { SearchRoleDto } from './search-role.dto';

export class SearchOperationLogDto extends SearchRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  username: string;

  @ApiPropertyOptional()
  @IsOptional()
  operation_module: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIP('4', {
    message: 'INVALID_IP_ADDRESS',
  })
  ip_address: string;

  @ApiPropertyOptional()
  @IsOptional()
  mobile_number: string;

  @ApiPropertyOptional()
  @IsOptional()
  operationModule: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIP('4', {
    message: 'INVALID_IP_ADDRESS',
  })
  ipAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  mobileNumber: string;
}
