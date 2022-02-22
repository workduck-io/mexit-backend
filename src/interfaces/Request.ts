import { ContentNode, LinkNode } from './Node';

export interface LinkNodeRequest extends LinkNode {
  workspaceIdentifier: string;
  createdBy: string;
}

export interface ContentNodeRequest extends ContentNode {
  workspaceIdentifier: string;
  createdBy: string;
}

export interface CopyOrMoveBlockRequest {
  blockId: string;
  sourceNodeId: string;
  destinationNodeId: string;
}
