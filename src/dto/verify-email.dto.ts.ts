import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty()
  verifyCode: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;
}
