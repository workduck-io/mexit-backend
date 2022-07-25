import { ClientNode, ContentNode, LinkNode } from './Node';

export interface NodeResponse {
  id: string;
  title?: string;
  data: NodeDataResponse[];
  lastEditedBy: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  itemType: string;
  version: number;
  namespaceID: string;
  workspaceIdentifier: string;
  bookmarked: boolean | null;
  template?: boolean;
}

export interface ActivityNodeResponse extends NodeResponse {
  nodeschemaIdentifier: 'ActivityNode';
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
  namespaceIdentifier: string;
  workspaceIdentifier: string;
  createdBy: string;
  content: LinkResponseContent[];
}

export interface LinkResponseContent {
  id?: string;
  type: string;
  children: TextType[] | LinkChildrenType[];
}

export interface LinkChildrenType {
  type: string;
  url: string;
  children: TextType[];
}

export interface TextType {
  text: string;
}

export interface ContentResponse extends ContentNode {
  createdAt: number;
  updatedAt: number;
  namespaceIdentifier: string;
  workspaceIdentifier: string;
  createdBy: string;
}

export interface ClientNodeResponse extends ClientNode {
  createdAt: number;
  updatedAt: number;
  namespaceIdentifier: string;
  workspaceIdentifier: string;
  createdBy: string;
}
