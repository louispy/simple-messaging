import { Controller, Body, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/users.request.dto';
import { UsersService } from './users.service';
import { RequestContextService } from '../request-context/request-context.service';
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('superadmin')
  create(@Body() payload: CreateUserDto) {
    const user = RequestContextService.getUser();
    payload.userId = user;
    return this.usersService.createUser(payload);
  }
}
