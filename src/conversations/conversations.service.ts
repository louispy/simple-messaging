import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  ClassConstructor,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { validateSync } from 'class-validator';
import Redis from 'ioredis';
import * as _ from 'lodash';

import { getPagination } from '../common/utils';
import { ELASTICSEARCH_MESSAGES_INDEX } from '../elasticsearch/elasticsearch.module';
import { MessagesRepository } from '../messages/messages.repository';
import { REDIS_CLIENT } from '../redis/redis.module';
import { RequestContextService } from '../request-context/request-context.service';
import { ConversationsRepository } from './conversations.repository';
import {
  CreateConversationRequestDto,
  GetMessagesRequestDto,
  SearchMessagesRequestDto,
} from './dto/conversation.request.dto';
import {
  CreateConversationResponseDto,
  GetMessagesResponseDto,
  MessageDto,
  SearchMessagesResponseDto,
} from './dto/conversation.response.dto';
import { Conversation } from './schemas/conversations.schema';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly repo: ConversationsRepository,
    private readonly messagesRepo: MessagesRepository,
    @Inject(ELASTICSEARCH_MESSAGES_INDEX) private readonly index: string,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async create(
    payload: CreateConversationRequestDto,
  ): Promise<CreateConversationResponseDto> {
    try {
      const user = RequestContextService.getUser();
      const conversation = new Conversation();
      conversation.createdBy = user.userId;
      conversation.updatedBy = user.userId;
      const newConversation = await this.repo.insert(conversation);

      return {
        id: newConversation.id,
        message: 'Success Create Conversation',
      } as CreateConversationResponseDto;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getMessages(
    payload: GetMessagesRequestDto,
  ): Promise<GetMessagesResponseDto> {
    const page = payload.page || 1;
    const limit = payload.limit || 10;
    const query: any = {
      conversationId: payload.conversationId,
    };
    const key = `get-messages:${JSON.stringify(instanceToPlain(payload))}`;
    const cached = await this.getCachedResponse<GetMessagesResponseDto>(
      key,
      GetMessagesResponseDto,
    );
    if (cached) {
      return cached;
    }

    const [messages, count] = await Promise.all([
      this.messagesRepo.find(query, page, limit, {
        sort: payload.sortBy || 'timestamp',
        sortDir: payload.sortDir || 'desc',
        select: payload.select,
      }),
      this.messagesRepo.count(query),
    ]);
    const res = {
      data: messages.map((message) => ({
        senderId: message.createdBy,
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata,
      })),
      paging: getPagination(page, limit, count),
    };

    await this.redis.set(key, JSON.stringify(res), 'EX', 60).catch();

    return res;
  }

  async searchMessages(
    payload: SearchMessagesRequestDto,
  ): Promise<SearchMessagesResponseDto> {
    try {
      const page = payload.page || 1;
      const limit = payload.limit || 10;
      let query: string = payload.q || '';

      const key = `search-messages:${JSON.stringify(instanceToPlain(payload))}`;
      const cached = await this.getCachedResponse<SearchMessagesResponseDto>(
        key,
        SearchMessagesResponseDto,
      );
      if (cached) {
        return cached;
      }

      const searchRes = await this.elasticsearchService.search({
        index: this.index,
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: {
            must: [
              {
                match: {
                  content: query,
                },
              },
              { term: { conversationId: payload.conversationId } },
            ],
          },
        },
        sort: {
          [payload.sortBy || 'timestamp']: payload.sortDir || 'desc',
        },
      });

      const res = {
        data: searchRes.hits.hits.map(
          (message) =>
            ({
              senderId: _.get(message, '_source.createdBy', ''),
              id: _.get(message, '_id', ''),
              conversationId: _.get(message, '_source.conversationId', ''),
              content: _.get(message, '_source.content', ''),
              timestamp: _.get(message, '_source.timestamp', ''),
              metadata: _.get(message, '_source.metadata'),
            }) as MessageDto,
        ),
        paging: getPagination(
          page,
          limit,
          _.get(searchRes, 'hits.total.value', 0),
        ),
      };

      await this.redis.set(key, JSON.stringify(res), 'EX', 60).catch();

      return res;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  private async getCachedResponse<T extends object>(
    key: string,
    cls: ClassConstructor<T>,
  ): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;
      const cachedRes = plainToInstance(cls, JSON.parse(cached));
      const errors = validateSync(cachedRes);
      if (errors.length > 0) {
        throw new Error(`Payload validation failed: ${JSON.stringify(errors)}`);
      }

      return cachedRes;
    } catch (err) {
      return null;
    }
  }
}
