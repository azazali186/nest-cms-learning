/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ForgetPasswordDto } from '../dto/forget-password.dto.ts';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto.ts';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto.ts';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  register(registerDto: RegisterDto) {
    return this.userRepository.register(registerDto);
  }

  async findAll(filterDto: SearchUserDto) {
    return this.userRepository.getUsers(filterDto);
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      relations: ['role'],
      where: {
        id: id,
      },
    });
  }

  login(loginDto: LoginDto) {
    return this.userRepository.login(loginDto);
  }
  logout(req: any) {
    return this.userRepository.logout(req);
  }
  resetPassword(resetPasswordDto: ResetPasswordDto) {
    throw new Error('Method not implemented.');
  }

  verifyEmail(verifyEmaildto: VerifyEmailDto) {
    throw new Error('Method not implemented.');
  }

  forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    throw new Error('Method not implemented.');
  }
}
