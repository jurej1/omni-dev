import { ZodType } from "zod";

export namespace BusEvent {
  export type Definition<P extends ZodType = ZodType> = ReturnType<
    typeof define<P>
  >;

  export function define<Properties extends ZodType>(
    type: string,
    properties: Properties
  ) {
    const result = {
      type,
      properties,
    };
    return result;
  }
}
