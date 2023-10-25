import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async findAll(filterDto: SearchUserDto): Promise<User[]> {
    return this.userRepository.getUsers(filterDto);
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result;
  }

  findById(userId: any) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id: id } });
  }

  updateUser(userId: string, updateData: UpdateUserDto): Promise<User> {
    return this.userRepository.updateUser(userId, updateData);
  }
}
