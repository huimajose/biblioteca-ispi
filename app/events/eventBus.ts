// src/events/eventBus.ts
type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void>;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on<T>(eventType: EventType, handler: EventHandler<T>) {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async emit<T>(event: DomainEvent<T>) {
    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}

export const eventBus = new EventBus();
