import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, {
    message: 'Invalid mobile number',
  })
  mobileNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
