import { IsOptional, IsString } from 'class-validator';

import { BaseRequest } from '../../common/dto/base.request';
import { DefaultGetQueryDto } from '../../common/dto/query.request';

export class CreateConversationRequestDto extends BaseRequest {}

export class GetMessagesRequestDto extends DefaultGetQueryDto {
  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class SearchMessagesRequestDto extends DefaultGetQueryDto {
  @IsString()
  @IsOptional()
  conversationId?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
