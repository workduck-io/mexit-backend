import { ContentNode, LinkNode } from './Node';

export interface LinkNodeRequest extends LinkNode {
  createdBy: string;
}

export interface ContentNodeRequest extends ContentNode {
  createdBy: string;
}

export interface CopyOrMoveBlockRequest {
  blockId: string;
  sourceNodeId: string;
  destinationNodeId: string;
}
