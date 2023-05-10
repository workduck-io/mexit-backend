import { AuthorizeRefreshTokenType, AuthorizeType } from './interfaces/Auth';
import { GenericObjectType, GenericType } from './interfaces/Generics';
import { GoogleAuthRefreshToken } from './interfaces/GoogleService';
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
  ConnectToLochService,
  ContentNodeRequest,
  CopyOrMoveBlockRequest,
  CreateNamespace,
  DeleteBlocksRequest,
  DeleteNamespace,
  EditBlockRequest,
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
  SmartCaptureRequest,
  SnippetUpdateVersionRequest,
  UpdateMetadata,
  UpdateNamespace,
  UpdateParentNodeForLochService,
} from './interfaces/Request';
import {
  ActivityNodeResponse,
  BulkResponse,
  ClientNodeResponse,
  ContentResponse,
  NodeDataResponse,
  NodeResponse,
} from './interfaces/Response';
import { SnippetUpdate } from './interfaces/Snippet';
import {
  InviteProperties,
  RegistrationStatus,
  User,
  UserMetadata,
  UserPreference,
  UserProperties,
} from './interfaces/User';
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
  EditBlockRequest: EditBlockRequest;
  CopyOrMoveBlock: CopyOrMoveBlock;
  BulkResponse: BulkResponse;
  UserPreference: UserPreference;
  User: User;
  InviteProperties: InviteProperties;
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
  RegistrationStatus: RegistrationStatus;
  UserMetadata: UserMetadata;
  UserProperties: UserProperties;
  ShortenLink: ShortenLink;
  Reminder: Reminder;
  Reaction: Reaction;
  Comment: Comment;
  T: any;
  UpdateMetadata: UpdateMetadata;
  DeleteNamespace: DeleteNamespace;
  ConnectToLochService: ConnectToLochService;
  UpdateParentNodeForLochService: UpdateParentNodeForLochService;
  SmartCaptureRequest: SmartCaptureRequest;
}
