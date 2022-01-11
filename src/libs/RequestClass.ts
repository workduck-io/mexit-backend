import Interfaces from '../Interfaces';
import { schemaValidator } from './schemavalidator';
export class RequestClass<T extends keyof Interfaces> {
  data?: Interfaces[T];
  params?: any;
  query?: any;
  constructor(req: any, type?: T) {
    if (req.body) {
      if (type) this.data = schemaValidator<T>(req.body, type);
      else this.data = JSON.parse(req.body);
    }
    this.params = req.params ? req.params : {};
    this.query = req.query ? req.query : {};
  }
}
