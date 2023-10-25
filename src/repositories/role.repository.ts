import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

export class RoleRepository extends Repository<Role> {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {
    super(
      roleRepository.target,
      roleRepository.manager,
      roleRepository.queryRunner,
    );
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { name, description } = createRoleDto;

    const oldRole = await this.roleRepository.findOne({
      where: { name },
    });

    if (oldRole) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Role exist with ${name} name`,
      });
    }

    const role = new Role();
    role.name = name;
    role.description = description;

    await this.roleRepository.save(role);

    return role;
  }
  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const updateRole = await this.roleRepository.findOne({
      where: { id: id },
      relations: ['users'],
    });
    if (!updateRole) {
      throw new NotFoundException({
        statusCode: 404,
        message: `Role not exist with ${id} id`,
      });
    }

    updateRole.name = updateRoleDto.name;
    updateRole.description = updateRoleDto.description;
    await this.roleRepository.save(updateRole);
    return updateRole;
  }
}
