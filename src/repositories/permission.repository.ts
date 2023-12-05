import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Repository } from 'typeorm';
import { AdminPageRepository } from './admin-page.repository';
import { ApiResponse } from 'src/utils2/response.util';

export class PermissionRepository extends Repository<Permission> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,

    @InjectRepository(AdminPageRepository)
    public apRepo: AdminPageRepository,
  ) {
    super(
      permissionRepo.target,
      permissionRepo.manager,
      permissionRepo.queryRunner,
    );
  }

  async findPermissionByAdminPage() {
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
            p.status = false;
          });
        });
      } else {
        page.isAccess = false;
      }
    });
    return ApiResponse(adminPages, 200);
  }
}
