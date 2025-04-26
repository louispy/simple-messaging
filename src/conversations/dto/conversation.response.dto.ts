import { PaginationResponse } from '../../common/dto/pagination.response';

export class CreateConversationResponseDto {
  id: string;
  message: string;
}

export class MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class GetMessagesResponseDto {
  data: MessageDto[];
  paging: PaginationResponse;
}

export class SearchMessagesResponseDto {
  data: MessageDto[];
  paging: PaginationResponse;
}
