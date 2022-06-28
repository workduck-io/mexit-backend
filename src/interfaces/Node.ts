export interface NodeDetail {
  id: string;
  title: string;
  path?: string;
  namespaceIdentifier: string;
  data: NodeData[];
}

export enum NodeAccessType {
  MANAGE = 'MANAGE',
  READ = 'READ',
  WRITE = 'WRITE',
}

export interface ShareNodeDetail {
  nodeID: string;
  userIDs: string[];
  accessType: NodeAccessType;
}

export interface UpdateAccessTypeForSharedNodeDetail {
  nodeId: string;
  userIDToAccessTypeMap: { [key: string]: NodeAccessType };
}

export interface ActivityNodeDetail extends NodeDetail {
  nodeschemaIdentifier: 'ActivityNode';
}
export interface ArchiveNodeDetail {
  ids: string[];
}
export interface NodeData {
  id: string;
  elementType?: string;
  parentID?: string;
  content?: string;
  children?: NodeChildData[];
}

export interface NodeChildData {
  id: string;
  content?: string;
  elementType?: string;
  properties?: { bold?: boolean; italic?: boolean };
  createdBy?: string;
  children?: NodeChildData[];
}

export interface Block {
  type: string;
  elements: NodeChildData[];
}

export interface LinkNode {
  id: string;
  long: string;
  short: string;
  metadata: {
    metaTags: MetaTag[];
    userTags: UserTag[];
  };
  shortenedURL: string;
}

export interface MetaTag {
  name: string;
  value: string;
}

export interface UserTag {
  value: string;
}

export interface ContentBlock {
  id: string;
}

export interface ContentNode {
  id: string;
  title: string;
  content?: any[];
  referenceID?: string;
  range?: {
    startMeta: {
      parentTagName: string;
      parentIndex: number;
      textOffset: number;
    };
    endMeta: {
      parentTagName: string;
      parentIndex: number;
      textOffset: number;
    };
    text: string;
  };
  metadata?: {
    metaTags?: MetaTag[];
    userTags?: UserTag[];
  };
  type?: string;
  nodePath?: string;
  appendNodeUID?: string;
  createNodeUID?: string;
}

export interface ClientNode {
  id: string;
  nodePath?: string;
  content?: ClientNodeContent[];
  createdBy: string;
}

export interface ClientNodeContent {
  type?: string;
  id: string;
  nodeUID?: string;
  children?: ClientNodeContentChildren[];
}

export interface ClientNodeContentChildren {
  type?: string;
  id: string;
  text: string;
  italic?: boolean;
  bold?: boolean;
}

export interface NodeMetadata {
  createdBy?: string;
  createdAt?: number;
  lastEditedBy?: string;
  updatedAt?: number;

  userTags?: any[];
  pageMetaTags?: any[];
}

export interface LinkCapture {
  long: string;
  short: string;
  metadata?: {
    metaTags?: MetaTag[];
    userTags?: UserTag[];
  };
}

export interface QueryStringParameters {
  getReverseOrder: boolean;
  blockSize: number;
  getMetaDataOfNode: boolean;
  startCursor?: string;
}

export interface CopyOrMoveBlock {
  type: 'BlockMovementRequest';
  blockID: string;
  sourceNodeID: string;
  destinationNodeID: string;
  action: 'move';
}

export interface ILink {
  nodeid: string;
  path: string;
}
