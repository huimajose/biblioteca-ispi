

export interface DomainEvent {
    type: EventType;
    payload: T;
    occurredAt: Date;
}