/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { ApiResponse } from 'src/utils/response.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    public userRepository: UserRepository,
  ) {}
  create(createUserDto: CreateUserDto, userId: number) {
    return this.userRepository.createUser(createUserDto, userId);
  }
  async findAll(filterDto: SearchUserDto) {
    return this.userRepository.getUsers(filterDto);
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return ApiResponse(null, 200, 'User Deleted');
  }

  findById(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }
  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username: username },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['roles'],
    });
    if (!user) {
      return new NotFoundException('User Not Found with this id');
    }
    const { password, ...others } = user;
    return others;
  }

  findSessionToken(toke: string) {
    return this.userRepository.findSessionToken(toke);
  }

  updateUser(userId: any, updateData: UpdateUserDto, user: any) {
    return this.userRepository.updateUser(userId, updateData, user);
  }

  changePassword(dtoReq: ChangePasswordDto, req: any) {
    return this.userRepository.changePassword(dtoReq, req);
  }
}
