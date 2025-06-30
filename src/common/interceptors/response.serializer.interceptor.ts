import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PlainLiteralObject,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { isObject, isPlainObject, merge } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface IResponseSerializerOptions {
  disable?: boolean;
  type?: any;
}

@Injectable()
export class ResponseSerializerInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next
      .handle()
      .pipe(
        map((res: PlainLiteralObject | PlainLiteralObject[]) =>
          this.serialize(res, context),
        ),
      );
  }

  public serialize(
    response: PlainLiteralObject | PlainLiteralObject[],
    context: ExecutionContext,
  ): PlainLiteralObject | PlainLiteralObject[] {
    const serializeOptions = this.getSerializeHandlerOptions(
      context.getClass(),
      context.getHandler(),
    );

    if (serializeOptions && serializeOptions.disable) {
      return response;
    }

    const isArray = Array.isArray(response);
    if (!isObject(response) && !isArray) {
      return response;
    }
    return isArray
      ? (response as PlainLiteralObject[]).map((item) =>
          this.transformToPlain(item, serializeOptions),
        )
      : this.transformToPlain(response, serializeOptions);
  }

  public transformToPlain(
    plainOrClass,
    serializeOptions: IResponseSerializerOptions,
  ): PlainLiteralObject {
    if (plainOrClass && plainOrClass.toJSON) {
      plainOrClass = plainOrClass.toJSON();
    }

    let targetObject = plainOrClass;

    if (serializeOptions && serializeOptions.type) {
      targetObject = new serializeOptions.type();
      Object.assign(targetObject, plainOrClass);
    }

    let objectResult: any = {};
    if (!isPlainObject(targetObject)) {
      objectResult = instanceToPlain(targetObject, {
        strategy: 'excludeAll',
      });
    } else {
      objectResult = targetObject;
    }
    return objectResult;
  }

  public getSerializeHandlerOptions(
    targetClass,
    targetHandler,
  ): IResponseSerializerOptions {
    return merge(
      {},
      Reflect.getMetadata('RESPONSE_SERIALIZER_OPTIONS', targetClass) || {},
      Reflect.getMetadata('RESPONSE_SERIALIZER_OPTIONS', targetHandler) || {},
    );
  }
}
