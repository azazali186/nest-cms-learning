import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from 'src/dto/create-role.dto';
import { RoleService } from 'src/services/role.service';

@ApiTags('Roles Management')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Post()
  createRole(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }
  @Get()
  findAll() {
    return this.roleService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
