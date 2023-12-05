import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { UpdateRoleDto } from 'src/dto/update-role.dto';
import { Role } from 'src/entities/role.entity';
import { Repository, In } from 'typeorm';
import { AdminPageRepository } from './admin-page.repository';
import { PermissionRepository } from './permission.repository';
import { ApiResponse } from 'src/utils2/response.util';
import { SearchRoleDto } from 'src/dto/search-role.dto';
import { LangService } from 'src/services/lang.service';
import { splitDateRange } from '../utils2/helper.utils';

export class RoleRepository extends Repository<Role> {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(AdminPageRepository)
    public apRepo: AdminPageRepository,
    @InjectRepository(PermissionRepository)
    public peramRepo: PermissionRepository,
    private langService: LangService,
  ) {
    super(
      roleRepository.target,
      roleRepository.manager,
      roleRepository.queryRunner,
    );
  }

  async createRole(req: CreateRoleDto, user) {
    const { name, description, permissions } = req;

    const oldRole = await this.roleRepository.findOne({
      where: { name },
    });

    if (oldRole) {
      throw new NotFoundException({
        statusCode: 409,
        message: `ROLE_EXIST`,
        param: name,
      });
    }

    const role = new Role();
    role.name = name;
    role.description = description;
    role.created_by = user;

    const rolePermissions = new Set<number>();

    permissions.forEach((p) => {
      p.children.forEach((cp) => {
        cp.permissions.forEach((permission) => {
          rolePermissions.add(permission);
        });
      });
    });

    const perm = await this.peramRepo.find({
      where: {
        id: In(Array.from(rolePermissions)),
      },
    });

    role.permissions = perm;

    await this.roleRepository.save(role);

    return ApiResponse(
      null,
      200,
      this.langService.getTranslation('CREATED_SUCCESSFULLY', 'Role'),
    );
  }

  async updateRole(roleId: number, updateRoleDto: UpdateRoleDto) {
    const { name, description, permissions } = updateRoleDto;

    // Start a transaction
    // await entityManager.transaction(async (transactionalEntityManager) => {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new NotFoundException({
        statusCode: 404,
        message: `ROLE_NOT_FOUND`,
        param: roleId,
      });
    }

    if (name) {
      role.name = name;
    }

    if (description) {
      role.description = description;
    }

    if (permissions) {
      const rolePermissions = new Set<number>();

      permissions.forEach((p) => {
        p.children.forEach((cp) => {
          cp.permissions.forEach((permission) => {
            rolePermissions.add(permission); // Assuming 'permission' has an 'id' property
          });
        });
      });

      const perm = await this.peramRepo.find({
        where: {
          id: In(Array.from(rolePermissions)),
        },
      });

      role.permissions = perm;
    }

    await this.roleRepository.save(role);
    // });

    return ApiResponse(
      null,
      200,
      this.langService.getTranslation('UPDATED_SUCCESSFULLY', 'Role'),
    );
  }

  async getRoleById(id: number) {
    const role = await this.findOne({
      relations: ['permissions'],
      where: {
        id: id,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role not found with id ${id}`);
    }

    const permissions = [
      ...new Set(role.permissions.flatMap((permission) => permission.name)),
    ];

    const adminPages = await this.apRepo
      .createQueryBuilder('admin_page')
      .leftJoinAndSelect('admin_page.children', 'children')
      .leftJoinAndSelect('children.permissions', 'permissions')
      .select([
        'admin_page.id',
        'admin_page.name',
        'admin_page.route_name',
        'children.id',
        'children.name',
        'children.route_name',
        'permissions.id',
        'permissions.name',
        'permissions.path',
      ])
      .where('admin_page.parent IS NULL')
      .getMany();

    adminPages.forEach((page) => {
      // Check the permission name and set the status
      const child = page.children;
      if (child) {
        child.forEach((c) => {
          c.permissions.map((p) => {
            const action = permissions.includes(p.name);
            p.status = action;
          });
        });
      } else {
        page.isAccess = false;
      }
    });

    role.adminPages = adminPages;
    role.permissions = [];
    return ApiResponse(
      role,
      200,
      this.langService.getTranslation('GET_DATA_SUCCESS', `Role`),
    );
  }

  async findAllRoleWithCount(req: SearchRoleDto) {
    const limit =
      req.limit && !isNaN(req.limit) && req.limit > 0 ? req.limit : 10;
    const offset =
      req.offset && !isNaN(req.offset) && req.offset >= 0 ? req.offset : 0;

    console.log(req);

    const query = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.users', 'user')
      .leftJoinAndSelect('role.created_by', 'created_by')
      .leftJoinAndSelect('role.updated_by', 'updated_by')
      .select([
        'role.id as id',
        'role.name as name',
        'role.description as description',
        'role.created_at as created_at',
        'role.updated_at as updated_at',
        'created_by.username as created_by',
        'updated_by.username as updated_by',
        'COUNT(user.id) AS users',
      ])
      .groupBy('role.id')
      .addGroupBy('role.name');

    if (req.name) {
      query.where('role.name LIKE :name', { name: `%${req.name}%` });
    }
    if (req.createdDate) {
      const { startDate, endDate } = splitDateRange(req.createdDate);
      query.andWhere('(role.created_at BETWEEN :startDate AND :endDate)', {
        startDate: startDate,
        endDate: endDate,
      });
    }

    const roles = await query.limit(limit).offset(offset).getRawMany();
    const count = await query.getCount();

    return ApiResponse(
      { list: roles, count },
      200,
      this.langService.getTranslation('GET_DATA_SUCCESS', 'Roles'),
    );
  }
}
