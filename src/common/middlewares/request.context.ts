import { NestMiddleware } from '@nestjs/common';

import { RequestContextService } from '../../request-context/request-context.service';

export class RequestContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    RequestContextService.cls.run({ req }, next);
  }
}
