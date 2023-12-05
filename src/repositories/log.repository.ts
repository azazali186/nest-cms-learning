import { InjectRepository } from '@nestjs/typeorm';
import { SearchOperationLogDto } from 'src/dto/search-operation-log.dto';
import { Log } from 'src/entities/log.entity';
import { LangService } from 'src/services/lang.service';
import { ApiResponse } from 'src/utils2/response.util';
import { Repository } from 'typeorm';
import { splitDateRange } from '../utils2/helper.utils';

export class LogRepository extends Repository<Log> {
  constructor(
    @InjectRepository(Log)
    private logRepo: Repository<Log>,
    private langService: LangService,
  ) {
    super(logRepo.target, logRepo.manager, logRepo.queryRunner);
  }

  async operationLogs(req: SearchOperationLogDto) {
    const { username, operationModule, ipAddress, mobileNumber, createdDate } =
      req;
    const limit =
      req.limit && !isNaN(req.limit) && req.limit > 0 ? req.limit : 10;
    const offset =
      req.offset && !isNaN(req.offset) && req.offset >= 0 ? req.offset : 0;

    const query = this.logRepo.createQueryBuilder('log');

    if (username) {
      query.andWhere(' log.requested_by LIKE :username ', {
        username: `%${username}%`,
      });
    }
    if (operationModule) {
      query.andWhere(
        '(log.admin_page LIKE :operationModule OR log.action LIKE :operationModule)',
        {
          operationModule: `%${operationModule}%`,
        },
      );
    }

    if (ipAddress) {
      query.andWhere('log.ip_address = :ip_address', { ipAddress });
    }

    if (mobileNumber) {
      query.andWhere('log.mobile_number = :mobile_number', { mobileNumber });
    }

    if (createdDate) {
      const { startDate, endDate } = splitDateRange(createdDate);
      query.andWhere('(log.created_at BETWEEN :startDate AND :endDate)', {
        startDate: startDate,
        endDate: endDate,
      });
    }

    const list = await query
      .select([
        'log.id as id',
        'log.browser  as browser',
        'log.ip_address as ip_address',
        'log.requested_by as requested_by',
        'log.admin_page as admin_page',
        'log.action as action',
        'log.created_at as created_at',
        'log.os as os',
        'log.platform as platform',
        'log.version as version',
        'log.response_time as response_time',
        'log.status_code as status_code',
        'log.mobile_number as mobile_number',
      ])
      .orderBy('log.id', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany();
    const count = await query.getCount();

    return ApiResponse(
      {
        list,
        count,
      },
      200,
      this.langService.getTranslation('GET_DATA_SUCCESS', 'Operation Logs'),
    );
  }
}
