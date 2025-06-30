import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

import { ConversationSchema } from '../../conversations/schemas/conversations.schema';

export type MessageDocument = Message & Document;

const transform = (doc: any, ret: any) => {
  const message = new Message();
  message.id = ret._id.toString();
  message.conversationId = ret.conversationId;
  message.content = ret.content;
  message.metadata = ret.metadata;
  message.timestamp = ret.timestamp;
  message.createdBy = ret.createdBy;

  return message;
};

@Schema({ toJSON: { transform }, timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ type: Types.ObjectId, ref: () => ConversationSchema })
  conversationId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ required: true })
  timestamp: Date;

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

export const MessageSchema = SchemaFactory.createForClass(Message);
