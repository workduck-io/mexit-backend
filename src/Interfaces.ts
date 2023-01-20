import { AuthorizeRefreshTokenType, AuthorizeType } from './interfaces/Auth';
import { GenericObjectType, GenericType } from './interfaces/Generics';
import { GoogleAuthRefreshToken } from './interfaces/GoogleService';
import { GotClientType, GotResponse } from './interfaces/GotClient';
import {
  ActivityNodeDetail,
  ArchiveNodeDetail,
  Block,
  ClientNode,
  ClientNodeContent,
  ClientNodeContentChildren,
  ContentBlock,
  ContentNode,
  CopyOrMoveBlock,
  ILink,
  MetaTag,
  NodeAccessType,
  NodeChildData,
  NodeData,
  NodeDetail,
  NodeMetadata,
  QueryStringParameters,
  ShareNodeDetail,
  UpdateAccessTypeForSharedNodeDetail,
  UpdateShareNodeDetail,
  UserTag,
} from './interfaces/Node';
import {
  AppendBlockRequest,
  BulkCreateNode,
  Comment,
  ContentNodeRequest,
  CopyOrMoveBlockRequest,
  CreateNamespace,
  DeleteBlocksRequest,
  DeleteNamespace,
  Filter,
  FilterJoin,
  FilterType,
  FilterValue,
  GetMultipleIds,
  GlobalFilterJoin,
  NodePath,
  PostView,
  Reaction,
  RefactorRequest,
  Reminder,
  RevokeAccessFromNamespace,
  ShareNamespace,
  ShortenLink,
  SnippetUpdateVersionRequest,
  UpdateMetadata,
  UpdateNamespace,
} from './interfaces/Request';
import {
  ActivityNodeResponse,
  BulkResponse,
  ClientNodeResponse,
  ContentResponse,
  NodeDataResponse,
  NodeResponse,
} from './interfaces/Response';
import { UserPreference } from './interfaces/User';
import { WDErrorType } from './interfaces/WDError';
import { errorCodes } from './libs/errorCodes';
import { statusCodes } from './libs/statusCodes';

import { SnippetUpdate } from './interfaces/Snippet';
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
  MetaTag: MetaTag;
  UserTag: UserTag;
  NodeResponse: NodeResponse;
  NodeDataResponse: NodeDataResponse;
  ContentNode: ContentNode;
  ContentNodeRequest: ContentNodeRequest;
  GetMultipleIds: GetMultipleIds;
  ContentResponse: ContentResponse;
  ClientNode: ClientNode;
  ClientNodeContent: ClientNodeContent;
  ClientNodeContentChildren: ClientNodeContentChildren;
  ClientNodeResponse: ClientNodeResponse;
  NodeMetadata: NodeMetadata;
  ContentBlock: ContentBlock;
  ActivityNodeDetail: ActivityNodeDetail;
  ActivityNodeResponse: ActivityNodeResponse;
  QueryStringParameters: QueryStringParameters;
  CopyOrMoveBlockRequest: CopyOrMoveBlockRequest;
  CopyOrMoveBlock: CopyOrMoveBlock;
  BulkResponse: BulkResponse;
  UserPreference: UserPreference;
  GoogleAuthRefreshToken: GoogleAuthRefreshToken;
  ILink: ILink;
  SnippetUpdate: SnippetUpdate;
  SnippetUpdateVersionRequest: SnippetUpdateVersionRequest;
  ArchiveNodeDetail: ArchiveNodeDetail;
  ShareNodeDetail: ShareNodeDetail;
  UpdateShareNodeDetail: UpdateShareNodeDetail;
  NodeAccessType: NodeAccessType;
  NodePath: NodePath;
  RefactorRequest: RefactorRequest;
  BulkCreateNode: BulkCreateNode;
  UpdateAccessTypeForSharedNodeDetail: UpdateAccessTypeForSharedNodeDetail;
  AppendBlockRequest: AppendBlockRequest;
  DeleteBlocksRequest: DeleteBlocksRequest;
  PostView: PostView;
  FilterValue: FilterValue;
  Filter: Filter;
  FilterType: FilterType;
  FilterJoin: FilterJoin;
  GlobalFilterJoin: GlobalFilterJoin;
  CreateNamespace: CreateNamespace;
  UpdateNamespace: UpdateNamespace;
  ShareNamespace: ShareNamespace;
  RevokeAccessFromNamespace: RevokeAccessFromNamespace;
  ShortenLink: ShortenLink;
  Reminder: Reminder;
  Reaction: Reaction;
  Comment: Comment;
  T: any;
  UpdateMetadata: UpdateMetadata;
  DeleteNamespace: DeleteNamespace;
}
