import { AuthorizeRefreshTokenType, AuthorizeType } from './interfaces/Auth';
import { GenericObjectType, GenericType } from './interfaces/Generics';
import { GotResponse, GotClientType } from './interfaces/GotClient';
import {
  NodeDetail,
  NodeChildData,
  NodeData,
  Block,
  LinkNode,
  MetaTag,
  UserTag,
} from './interfaces/Node';
import { LinkNodeRequest } from './interfaces/Request';
import {
  NodeResponse,
  NodeDataResponse,
  LinkResponse,
} from './interfaces/Response';
import { WDErrorType } from './interfaces/WDError';
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
  AuthorizeType: AuthorizeType;
  AuthorizeRefreshTokenType: AuthorizeRefreshTokenType;
  GotResponse: GotResponse;
  GotClientType: GotClientType;
  LinkNode: LinkNode;
  MetaTag: MetaTag;
  UserTag: UserTag;
  LinkNodeRequest: LinkNodeRequest;
  NodeResponse: NodeResponse;
  NodeDataResponse: NodeDataResponse;
  LinkResponse: LinkResponse;
}
