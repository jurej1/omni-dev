import { BusEvent } from "./bus-event";
import z, { ZodType } from "zod";

export namespace Bus {
  export type Event<D extends BusEvent.Definition<ZodType> = BusEvent.Definition<ZodType>> = {
    type: D["type"];
    properties: z.output<D["properties"]>;
  };

  type Subscription = (event: Event) => void;

  const subscriptions = (() => new Map<string, Subscription[]>())();

  export async function publish<D extends BusEvent.Definition<ZodType>>(
    def: D,
    data: z.output<D["properties"]>
  ): Promise<void[]> {
    const payload: Event<D> = {
      type: def.type,
      properties: data,
    };
    const pending = [];

    const match = subscriptions.get(def.type) ?? [];

    // invoking function
    for (const subscription of match) pending.push(subscription(payload));

    return Promise.all<void>(pending);
  }

  export function subscribe<D extends BusEvent.Definition<ZodType>>(
    def: D,
    callback: (event: Event<D>) => void
  ) {
    let match = subscriptions.get(def.type) ?? [];
    match.push(callback);
    subscriptions.set(def.type, match);

    return () => {
      const match = subscriptions.get(def.type);
      if (!match) return;
      const index = match.indexOf(callback);
      if (index === -1) return;
      const items = match.splice(index, 1);
      subscriptions.set(def.type, items);
    };
  }
}
