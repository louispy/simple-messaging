import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DefaultRepository } from '../common/repository/default.repository';
import { Conversation, ConversationDocument } from './entities/conversations.schema';

@Injectable()
export class ConversationsRepository extends DefaultRepository<Conversation> {
  constructor(
    @InjectModel(Conversation.name) protected readonly model: Model<ConversationDocument>,
  ) {
    super(model);
  }
}
