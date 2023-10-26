/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { UserStatus } from 'src/enum/user-status.enum';

export class SearchUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([UserStatus.ACTIVE, UserStatus.INACTIVE])
  status: UserStatus;
  
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  search: string;
}
