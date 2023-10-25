import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForgetPasswordDto } from 'src/dto/forget-password.dto.ts';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto.ts';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { VerifyEmailDto } from 'src/dto/verify-email.dto.ts';
import { AuthService } from 'src/services/auth.service';

@ApiTags('Auth Management')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('forgot-password')
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  verifyEmail(@Body() verifyEmaildto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmaildto);
  }
}
