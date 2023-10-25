import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ForgetPasswordDto } from 'src/dto/forget-password.dto.ts';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto.ts';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { VerifyEmailDto } from 'src/dto/verify-email.dto.ts';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth.service';

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

  @Post('forget-password')
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
