/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';
import { UserStatus } from 'src/enum/user-status.enum';
import { SearchBaseDto } from './search-base-dto';

export class SearchUserDto extends SearchBaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([UserStatus.ACTIVE, UserStatus.INACTIVE, ''])
  status: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  search: string;
}
