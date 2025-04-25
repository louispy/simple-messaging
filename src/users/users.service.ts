import { Injectable, BadRequestException } from '@nestjs/common';
import { RequestContextService } from '../request-context/request-context.service';
import { CreateUserDto } from './dto/users.request.dto';
import { User } from './schemas/users.schema';
import { UsersRepository } from './users.repository';

import { hash } from 'bcrypt';
import { CreateUserResponse } from './dto/users.response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async createUser(payload: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const currUser = RequestContextService.getUser();
      const user = new User();
      user.username = payload.username;
      user.password = await hash(payload.password, 10);
      user.name = payload.name || '';
      user.email = payload.email || '';
      user.roles = payload.roles || [];
      user.createdBy = currUser.userId;
      user.updatedBy = currUser.userId;
      const newUser = await this.repo.insert(user);

      return {
        id: newUser.id,
        message: 'Success create user',
      } as CreateUserResponse;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findOne(username: string): Promise<User | null> {
    return this.repo.findByIdentifier(username);
  }
}
