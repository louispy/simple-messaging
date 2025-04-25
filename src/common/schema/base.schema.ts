import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class BaseSchema {
  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, default: '1' })
  createdBy: string;

  @Prop({ type: Types.ObjectId, default: '1' })
  updatedBy: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
