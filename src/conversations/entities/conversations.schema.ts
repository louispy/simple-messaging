import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ConversationDocument = Conversation & Document;

const transform = (doc: any, ret: any) => {
  const conversation = new Conversation();
  conversation.id = ret._id.toString();

  return conversation;
};


@Schema({ toJSON: { transform }, timestamps: true })
export class Conversation {
  @Prop({ type: Types.ObjectId })
  id: string;

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

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
