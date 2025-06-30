import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DefaultRepository } from '../common/repository/default.repository';
import { User, UserDocument } from './entities/users.schema';

@Injectable()
export class UsersRepository extends DefaultRepository<User> {
  constructor(
    @InjectModel(User.name) protected readonly model: Model<UserDocument>,
  ) {
    super(model);
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const user = await this.model.findOne({
      $or: [{ username: identifier }, { email: identifier }],
      isDeleted: false,
    });
    return user ? user.toJSON() : null;
  }
}
