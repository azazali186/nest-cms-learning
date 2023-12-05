import { InjectRepository } from '@nestjs/typeorm';
import { AdminPage } from 'src/entities/admin-page.entity';
import { Repository } from 'typeorm';

export class AdminPageRepository extends Repository<AdminPage> {
  constructor(
    @InjectRepository(AdminPage)
    private apRepo: Repository<AdminPage>,
  ) {
    super(apRepo.target, apRepo.manager, apRepo.queryRunner);
  }
}
