/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchPermissionDto } from 'src/dto/search-permission.dto';
import { Permission } from 'src/entities/permission.entity';
import { PermissionRepository } from 'src/repositories/permission.repository';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionRepository)
    public permissionRepository: PermissionRepository,
  ) {}

  async remove(id: number) {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return result;
  }

  findAll(filterDto: SearchPermissionDto) {
    return this.permissionRepository.findPermissionByAdminPage();
  }
}
