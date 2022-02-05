/* eslint-disable @typescript-eslint/no-explicit-any */
export interface NodeDetail {
  type: string;
  id: string;
  namespaceIdentifier: string;
  workspaceIdentifier: string;
  data: NodeData[];
  lastEditedBy: string;
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
  properties?: { bold: boolean; italic: boolean };
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
  id: string;
  text: string;
}

export interface ContentNode {
  id: string;
  long: string;
  content?: any[];
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
    metaTags: MetaTag[];
    userTags: UserTag[];
  };
}

export interface ClientNode {
  id: string;
  content?: ClientNodeContent[];
  workspace: string;
  createdBy: string;
}

export interface ClientNodeContent {
  type?: string;
  id: string;
  nodeUID: string;
  children?: ClientNodeContentChildren[];
}

export interface ClientNodeContentChildren {
  type?: string;
  id: string;
  text: string;
  italic?: boolean;
  bold?: boolean;
}
