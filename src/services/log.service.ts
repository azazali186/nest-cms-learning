import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchOperationLogDto } from 'src/dto/search-operation-log.dto';
import { LogRepository } from 'src/repositories/log.repository';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(LogRepository)
    public logRepo: LogRepository,
  ) {}

  operationLogs(req: SearchOperationLogDto) {
    return this.logRepo.operationLogs(req);
  }
}
