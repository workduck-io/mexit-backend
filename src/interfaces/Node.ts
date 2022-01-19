export interface NodeDetail {
  id: string;
  namespaceIdentifier: string;
  workspaceIdentifier: string;
  data: NodeData[];
  lastEditedBy: string;
}

export interface NodeData {
  id: string;
  elementType: string;
  children: NodeChildData[];
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

export interface CommentDetail {
  type: string;
  nodeID: string;
  blockID: string;
  commentID: string;
  commentedBy: string;
  commentBody: CommentBodyType;
}

export interface CommentBodyType {
  id: string;
  elementType: string;
  content: string;
}
