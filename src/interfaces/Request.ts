import { ContentNode } from './Node';

export interface ContentNodeRequest extends ContentNode {
  createdBy?: string;
}

export interface GetMultipleIds {
  ids: Array<string>; //Array of nodeids
}

export interface SnippetUpdateVersionRequest extends ContentNode {
  version: number;
}

export interface CopyOrMoveBlockRequest {
  blockId: string;
  sourceNodeId: string;
  destinationNodeId: string;
}

export interface NodePath {
  path: string;
  namespaceID: string;
}

export interface RefactorRequest {
  existingNodePath: NodePath;
  newNodePath: NodePath;
  nodeID: string;
}

export interface BulkCreateNode {
  nodePath: NodePath;
  id: string;
  title: string;
  data?: any[];
  tags?: any[];
}

export interface DeleteBlocksRequest {
  [nodeId: string]: string[]; //nodeId : List of blockIds
}
export interface AppendBlockRequest {
  elements: any[];
}

export type GlobalFilterJoin = 'all' | 'any';

const FilterTypeArray = [
  'note', // Does item belong to note
  'tag', // Does item have tag
  'date', // Does item have date TODO: Use updated and created will need before after and range
  'state', // Does item have a specific

  'status',
  'priority',

  // TODO: Determine whether it will be a single select or not
  'has', // Does item have a specific data property
  // For reminders, has is used to determine if the reminder has a todo attached

  'mention', // Does item mention a specific user
  'space', // Does item belong to a specific space
] as const;

// Produces a union type of the values of FilterTypeArray
export type FilterType = (typeof FilterTypeArray)[number];

const FilterJoinArray = [
  'all', // All values should match
  'any', // Any value should match
  'notAny', // Any value should not match (if any one matches, item dropped)
  'none', // None of the values should match (if some match, item passed, if all match item dropped)
] as const;

// How to join the values of a single filter
export type FilterJoin = (typeof FilterJoinArray)[number];

export interface FilterValue {
  id: string;
  label: string;
  value: string;
  count?: number;
}

export interface Filter {
  id: string;
  type: FilterType;
  join: FilterJoin;
  multiple: boolean;
  values: FilterValue[] | FilterValue;
}

export interface PostView {
  workspaceId: string;
  properties: { [key: string]: any };
  entityId: string;
  filters: Filter[];
}

export interface CreateNamespace {
  id: string;
  name: string;
  type?: string;
}

export interface UpdateNamespace {
  id: string;
  name: string;
  metadata?: {
    icon?: {
      type: string;
      value: string;
    };
  };
}

export interface ShareNamespace {
  namespaceID: string;
  userIDToAccessTypeMap: { [key: string]: string };
}

export interface RevokeAccessFromNamespace {
  namespaceID: string;
  userIDs: string[];
}

export interface ShortenLink {
  url: string;
  expiry?: number;
  alias?: string;
  properties?: any;
  tags?: string[];
}

export interface Reminder {
  nodeId?: string;
  entityId: string;
  properties?: any;
}

export interface Reaction {
  nodeId: string;
  blockId: string;
  reaction: {
    type: string;
    value: string;
  };
  action: 'ADD' | 'DELETE';
}

export interface Comment {
  nodeId: string;
  blockId: string;
  threadId?: string;
  entityId: string;
  properties?: any;
  content: any[];
}

export interface UpdateMetadata {
  metadata: {
    templateID?: string;
    icon?: any;
  };
}

export interface DeleteNamespace {
  successorNamespaceID?: string;
}

export interface ConnectToLochService {
  serviceId: string;
  serviceType: string;
  mexId: string;
  parentNodeId: string;
  namespaceId: string;
}

export interface UpdateParentNodeForLochService {
  serviceId: string;
  serviceType: string;
  parentNodeId: string;
  namespaceId: string;
}

export interface BaseEntityRequest {
  nodeNamespaceMap?: {
    nodeID: string;
    namespaceID: string;
  };
}

export interface SmartCaptureRequest extends BaseEntityRequest {
  data: {
    id: string;
    content: string;
    elementType: 'smartCapture';
    elementMetadata: any;
    children: Array<any>;
  };
}

export interface HighlightRequest extends BaseEntityRequest {
  data?: {
    properties: Record<string, any>;
  };
}

export interface GetBroadcastMessageRequest {
  timestamp: number;
}
