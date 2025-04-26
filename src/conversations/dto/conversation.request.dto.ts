import { IsOptional, IsString } from 'class-validator';
import { DefaultGetQueryDto } from '../../common/dto/query.request';

export class CreateConversationRequestDto {}

export class GetMessagesRequestDto extends DefaultGetQueryDto {
  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class SearchMessagesRequestDto extends DefaultGetQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
