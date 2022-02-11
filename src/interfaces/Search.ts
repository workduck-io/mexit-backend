export interface Document {
  id: string;
  nodePath: string;
}

export interface SearchHit extends Document {
  _matchesInfo?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface SearchResults {
  hits: SearchHit[];
  total: number;
  count: number;
}
