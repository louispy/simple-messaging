import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OutboxEventStatus {
  Pending = 1,
  Processing,
  Sent,
}

export type OutboxDocument = Outbox & Document;

const transform = (doc: any, ret: any) => {
  const outboxEvent = new Outbox();
  outboxEvent.id = ret._id.toString();
  outboxEvent.topic = ret.topic;
  outboxEvent.key = ret.key;
  outboxEvent.message = ret.message;
  outboxEvent.status = ret.status;
  return outboxEvent;
};

@Schema({ toJSON: { transform }, timestamps: true })
export class Outbox {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  metadata: string;

  @Prop({ type: Number, required: true, default: OutboxEventStatus.Pending })
  status: OutboxEventStatus;

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

export const OutboxSchema = SchemaFactory.createForClass(Outbox);
