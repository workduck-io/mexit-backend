import { Entity, Schema } from 'redis-om';

export class HighlightNode extends Entity {
  pageUrl: string;
  highlightRange: string;
}

export const highlightNodeSchema = new Schema(
  HighlightNode,
  {
    pageUrl: { type: 'string' },
    highlightRange: { type: 'string' },
  },
  {
    dataStructure: 'JSON',
  }
);
