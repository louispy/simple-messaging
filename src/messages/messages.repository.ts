import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DefaultRepository } from '../common/repository/default.repository';
import { Message, MessageDocument } from './schemas/messages.schema';

@Injectable()
export class MessagesRepository extends DefaultRepository<Message> {
  constructor(
    @InjectModel(Message.name) protected readonly model: Model<MessageDocument>,
  ) {
    super(model);
  }
}
