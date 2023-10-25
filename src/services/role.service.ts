import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { RoleRepository } from 'src/repositories/role.repository';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    public roleRepo: RoleRepository,
  ) {}

  createRole(createRoleDto: CreateRoleDto) {
    return this.roleRepo.createRole(createRoleDto);
  }
  findAll() {
    return this.roleRepo.find({
      relations: ['users', 'permissions'],
    });
  }
  findOne(id: string) {
    return this.roleRepo.findOne({
      where: { id },
      relations: ['users'],
    });
  }
  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.roleRepo.updateRole(id, updateRoleDto);
  }
  remove(id: string) {
    return this.roleRepo.delete(id);
  }
}
