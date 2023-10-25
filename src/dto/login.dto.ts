import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+\d{1,3}[- ]?)?\d{10}$/, {
    message: 'Invalid mobile number',
  })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
