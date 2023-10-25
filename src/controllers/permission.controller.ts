import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchPermissionDto } from 'src/dto/search-permission.dto';
import { Permission } from 'src/entities/permission.entity';
import { PermissionService } from 'src/services/permission.service';

@ApiTags('Permissions Management')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  findAll(filterDto: SearchPermissionDto): Promise<Permission[]> {
    return this.permissionService.findAll(filterDto);
  }
}
