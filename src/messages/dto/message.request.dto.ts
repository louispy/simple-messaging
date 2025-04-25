import { IsNotEmpty, IsObject, IsOptional, IsString, Validate } from 'class-validator';

import { IsObjectId } from '../../common/validators/oid.validator';

export class CreateMessageRequestDto {
  @IsString()
  @Validate(IsObjectId)
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
