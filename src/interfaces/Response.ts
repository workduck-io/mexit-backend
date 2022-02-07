import { ClientNode, ContentNode, LinkNode } from './Node';

export interface NodeResponse {
  id: string;
  data: NodeDataResponse[];
  lastEditedBy: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  itemType: string;
  version: number;
  namespaceID: string;
  workspaceID: string;
  bookmarked: boolean | null;
}

export interface NodeDataResponse {
  id: string;
  parentID: string | null;
  content: string;
  children?: NodeDataResponse[];
  elementType: string;
  properties?: {
    bold?: boolean;
    italic?: boolean;
  };
  createdBy: string;
  lastEditedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface LinkResponse extends LinkNode {
  createdAt: number;
  updatedAt: number;
  namespace: string;
  workspace: string;
  createdBy: string;
}

export interface ContentResponse extends ContentNode {
  createdAt: number;
  updatedAt: number;
  namespace: string;
  workspace: string;
  createdBy: string;
}

export interface ClientNodeResponse extends ClientNode {
  createdAt: number;
  updatedAt: number;
  namespace: string;
  workspace: string;
  createdBy: string;
}
