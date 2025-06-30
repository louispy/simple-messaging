import { AsyncLocalStorage } from 'async_hooks';
import * as _ from 'lodash';

import { RequestContext } from './request-context.dto';

// singleton class
export class RequestContextService {
  public static cls = new AsyncLocalStorage<RequestContext>();

  public static getUser(): any {
    const store = this.cls.getStore();
    return _.get(store, 'req.user', {});
  }
}
