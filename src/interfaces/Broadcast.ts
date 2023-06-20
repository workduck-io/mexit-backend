export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export type EntityType =
  | 'HIGHLIGHT'
  | 'NOTE'
  | 'CAPTURE'
  | 'NAMESPACE'
  | 'PROMPT'
  | 'SNIPPET'
  | 'LINK'
  | 'USER'
  | 'VIEW'
  | 'WORKSPACE';

export interface BroadcastMessage {
  operationType: OperationType;
  entityId: string;
  entityType: EntityType;
  payload?: any;
}
