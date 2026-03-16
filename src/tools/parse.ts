import { z } from "zod";

export namespace ToolUtil {
  export function parseInput<T>(
    schema: z.ZodSchema<T>,
    raw: string,
  ): Partial<T> {
    try {
      const result = schema.safeParse(JSON.parse(raw));
      return result.success ? result.data : {};
    } catch {
      return {};
    }
  }

  export function parseOutput<T>(
    schema: z.ZodSchema<T>,
    raw: string,
  ): T | null {
    try {
      const result = schema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }
}
