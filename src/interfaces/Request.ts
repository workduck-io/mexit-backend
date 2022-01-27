import { LinkNode } from './Node';

export interface LinkNodeRequest extends LinkNode {
  workspace: string;
  createdBy: string;
}
