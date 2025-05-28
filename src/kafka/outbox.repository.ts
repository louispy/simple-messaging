import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DefaultRepository } from '../common/repository/default.repository';
import { Outbox, OutboxDocument } from './schemas/outbox.schema';

@Injectable()
export class OutboxRepository extends DefaultRepository<Outbox> {
  constructor(
    @InjectModel(Outbox.name) protected readonly model: Model<OutboxDocument>,
  ) {
    super(model);
  }
}
