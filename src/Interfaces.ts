import { TextType } from 'aws-sdk/clients/polly';
import { AuthorizeRefreshTokenType, AuthorizeType } from './interfaces/Auth';
import { GoogleAuthRefreshToken } from './interfaces/GoogleService';
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
  ContentNode,
  ClientNodeContentChildren,
  ClientNodeContent,
  ClientNode,
  LinkCapture,
  NodeMetadata,
  ContentBlock,
  ActivityNodeDetail,
  QueryStringParameters,
  CopyOrMoveBlock,
  ILink,
  ArchiveNodeDetail,
  ShareNodeDetail,
  NodeAccessType,
  UpdateAccessTypeForSharedNodeDetail,
  UpdateShareNodeDetail,
} from './interfaces/Node';
import {
  AppendBlockRequest,
  ContentNodeRequest,
  CopyOrMoveBlockRequest,
  LinkNodeRequest,
  SnippetUpdateVersionRequest,
  RefactorRequest,
  NodePath,
  BulkCreateNode,
  RegisterUserRequest,
} from './interfaces/Request';
import {
  NodeResponse,
  NodeDataResponse,
  LinkResponse,
  ContentResponse,
  ClientNodeResponse,
  LinkResponseContent,
  LinkChildrenType,
  ActivityNodeResponse,
} from './interfaces/Response';
import { UserPreference } from './interfaces/User';
import { WDErrorType } from './interfaces/WDError';
import { errorCodes } from './libs/errorCodes';
import { statusCodes } from './libs/statusCodes';

import schema from './types.json';
import { SnippetUpdate } from './interfaces/Snippet';

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
  LinkCapture: LinkCapture;
  LinkNodeRequest: LinkNodeRequest;
  NodeResponse: NodeResponse;
  NodeDataResponse: NodeDataResponse;
  LinkResponse: LinkResponse;
  ContentNode: ContentNode;
  ContentNodeRequest: ContentNodeRequest;
  ContentResponse: ContentResponse;
  ClientNode: ClientNode;
  ClientNodeContent: ClientNodeContent;
  ClientNodeContentChildren: ClientNodeContentChildren;
  ClientNodeResponse: ClientNodeResponse;
  LinkResponseContent: LinkResponseContent;
  LinkChildrenType: LinkChildrenType;
  TextType: TextType;
  NodeMetadata: NodeMetadata;
  ContentBlock: ContentBlock;
  ActivityNodeDetail: ActivityNodeDetail;
  ActivityNodeResponse: ActivityNodeResponse;
  QueryStringParameters: QueryStringParameters;
  CopyOrMoveBlockRequest: CopyOrMoveBlockRequest;
  CopyOrMoveBlock: CopyOrMoveBlock;
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
  RegisterUserRequest: RegisterUserRequest;
  UpdateAccessTypeForSharedNodeDetail: UpdateAccessTypeForSharedNodeDetail;
  AppendBlockRequest: AppendBlockRequest;
  PostView: PostView;
}
