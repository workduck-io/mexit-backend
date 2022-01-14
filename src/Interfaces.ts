import { GenericObjectType, GenericType } from './interfaces/Generics';
import { NodeDetail, NodeChildData, NodeData, Block } from './interfaces/Node';
import { WDErrorType } from './interfaces/WDError';
import { Namespace, Workspace } from './interfaces/WorkSpace';
import { errorCodes } from './libs/errorCodes';
import { statusCodes } from './libs/statusCodes';

import schema from './types.json';

type SchemaType = typeof schema.definitions;
type Definitions = { [x in keyof SchemaType]: unknown };
export default class Interfaces implements Definitions {
  NodeDetail: NodeDetail;
  NodeChildData: NodeChildData;
  NodeData: NodeData;
  WDErrorType: WDErrorType;
  errorCodes: errorCodes;
  statusCodes: statusCodes;
  GenericType: GenericType;
  GenericObjectType: GenericObjectType;
  Block: Block;
  Workspace: Workspace;
  Namespace: Namespace;
}
