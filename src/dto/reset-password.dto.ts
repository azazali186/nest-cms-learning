import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty()
  otp: string;

  @ApiProperty()
  mobileNumber: string;

  @ApiProperty()
  newPassword: string;
}
