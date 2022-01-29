import { ContentNode, LinkNode } from './Node';

export interface LinkNodeRequest extends LinkNode {
  workspace: string;
  createdBy: string;
}

export interface ContentNodeRequest extends ContentNode {
  workspace: string;
  createdBy: string;
}
