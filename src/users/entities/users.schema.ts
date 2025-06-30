import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

const transform = (doc: any, ret: any) => {
  const user = new User();
  user.id = ret._id.toString();
  user.username = ret.username;
  user.password = ret.password;
  user.email = ret.email;
  user.name = ret.name;
  user.roles = ret.roles;
  user.company = ret.company;
  return user;
};

@Schema({ toJSON: { transform }, timestamps: true })
export class User {
  @Prop({ type: Types.ObjectId })
  id: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  name: string;

  @Prop({ type: [String], required: true })
  roles: string[];

  @Prop({ required: true })
  company: string;

  @Prop({ required: false })
  email: string;

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

export const UserSchema = SchemaFactory.createForClass(User);
