import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { SearchRoleDto } from 'src/dto/search-role.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { RoleRepository } from 'src/repositories/role.repository';
import { ApiResponse } from 'src/utils2/response.util';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    public roleRepo: RoleRepository,
  ) {}

  createRole(createRoleDto: CreateRoleDto, userId) {
    return this.roleRepo.createRole(createRoleDto, userId);
  }
  async findAll(name: SearchRoleDto) {
    return this.roleRepo.findAllRoleWithCount(name);
  }
  findOne(id: number) {
    return this.roleRepo.getRoleById(id);
  }
  update(id: any, req: UpdateRoleDto) {
    return this.roleRepo.updateRole(id, req);
  }
  async remove(id: number) {
    const res = await this.roleRepo.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return ApiResponse(null, 200, 'Role Deleted');
  }
}
