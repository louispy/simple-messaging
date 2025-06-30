import {
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsObjectId } from '../../common/validators/oid.validator';

export interface BaseConsumerMessageDto {
  metadata: Record<string, any>;
  data: any;
}

export class IndexMessageMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsString()
  @Validate(IsObjectId)
  createdBy: string;

  @IsDateString()
  timestamp: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
