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
  properties: { bold: boolean; italic: boolean };
}
