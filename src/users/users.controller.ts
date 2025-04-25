import { Controller, Body, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/users.request.dto';
import { UsersService } from './users.service';
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('superadmin')
  create(@Body() payload: CreateUserDto) {
    return this.usersService.createUser(payload);
  }
}
