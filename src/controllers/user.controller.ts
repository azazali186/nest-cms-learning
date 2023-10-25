import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchUserDto } from 'src/dto/search-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User } from 'src/entities/user.entity';
import { UserStatus } from 'src/enum/user-status.enum';
import { UserStatusValidationPipes } from 'src/pipes/user-status-validation.pipe';
import { UserService } from 'src/services/user.service';

@ApiTags('User Management')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiQuery({ name: 'status', enum: UserStatus })
  @Get('')
  findAll(
    @Query(UserStatusValidationPipes) filterDto: SearchUserDto,
  ): Promise<User[]> {
    return this.userService.findAll(filterDto);
  }

  @Get('/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch('/:id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/:id')
  remove(@Param() id: string) {
    return this.userService.remove(id);
  }
}
