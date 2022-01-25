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
  elementType: string;
  content?: string;
  children?: NodeChildData[];
}

export interface NodeChildData {
  id: string;
  content: string;
  elementType: string;
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
