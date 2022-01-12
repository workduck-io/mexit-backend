import { NodeDetail, NodeChildData, NodeData } from './interfaces/Node';
import { WDErrorType } from './interfaces/WDError';
import { errorCodes } from './libs/errorCodes';
import { statusCodes } from './libs/statusCodes';

import schema from './types.json';

type SchemaType = typeof schema.definitions;
type Definitions = { [x in keyof SchemaType]: Object };
export default class Interfaces implements Definitions {
  NodeDetail: NodeDetail;
  NodeChildData: NodeChildData;
  NodeData: NodeData;
  WDErrorType: WDErrorType;
  errorCodes: errorCodes;
  statusCodes: statusCodes;
}
