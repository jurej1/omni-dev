import { ZodType } from "zod";

export namespace BusEvent {
  export type Definition<
    T extends string = string,
    P extends ZodType = ZodType,
  > = {
    type: T;
    properties: P;
  };

  export function define<T extends string, P extends ZodType>(
    type: T,
    properties: P,
  ): Definition<T, P> {
    return { type, properties };
  }
}

export namespace Bus {
  type Subscription = (event: any) => void;

  const subscriptions = new Map<string, Subscription>();

  export function publish(event: BusEvent.Definition) {
    const subs = subscriptions.get(event.type);
    if (subs) {
      subs(event);
    }
  }

  export function subscribe(eventType: string, callback: Subscription) {
    subscriptions.set(eventType, callback);
  }
}
