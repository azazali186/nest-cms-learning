import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Repository } from 'typeorm';

export class PermissionRepository extends Repository<Permission> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {
    super(
      permissionRepo.target,
      permissionRepo.manager,
      permissionRepo.queryRunner,
    );
  }
}
