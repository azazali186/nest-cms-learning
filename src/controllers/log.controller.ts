import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchOperationLogDto } from 'src/dto/search-operation-log.dto';
import { LogService } from 'src/services/log.service';

@ApiTags('Audit Management')
@ApiBearerAuth()
@Controller('audit')
export class LogController {
  constructor(private readonly logService: LogService) {}
  @Get('/operation-logs')
  operationLogs(@Query() req: SearchOperationLogDto) {
    return this.logService.operationLogs(req);
  }
}
