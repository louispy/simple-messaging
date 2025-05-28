import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';

import { BaseRequest } from '../../common/dto/base.request';
import { IsObjectId } from '../../common/validators/oid.validator';

export class CreateMessageRequestDto extends BaseRequest {
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

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
