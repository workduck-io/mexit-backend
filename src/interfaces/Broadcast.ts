export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface BroadcastMessage {
    operationType: OperationType,
    entityId: string,
    entityType: string,
    payload: any
}