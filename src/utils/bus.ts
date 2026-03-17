import { z } from "zod"

export namespace Bus {
  type Callback<T> = (data: T) => void
  type Unsubscribe = () => void

  const listeners = new Map<string, Callback<unknown>[]>()
  const registry = new Map<string, z.ZodTypeAny>()

  export function register(type: string, schema: z.ZodTypeAny): void {
    registry.set(type, schema)
  }

  export function subscribe<T = unknown>(type: string, callback: Callback<T>): Unsubscribe {
    const schema = registry.get(type)

    const wrapped: Callback<unknown> = (data) => {
      const validated = schema ? schema.parse(data) : data
      callback(validated as T)
    }

    const current = listeners.get(type) ?? []
    listeners.set(type, [...current, wrapped])

    return () => {
      const cbs = listeners.get(type) ?? []
      listeners.set(type, cbs.filter((cb) => cb !== wrapped))
    }
  }

  export function publish<T = unknown>(type: string, data: T): void {
    const schema = registry.get(type)
    const validated = schema ? (schema.parse(data) as T) : data

    const cbs = [...(listeners.get(type) ?? [])]
    const errors: unknown[] = []

    for (const cb of cbs) {
      try {
        cb(validated)
      } catch (err) {
        errors.push(err)
      }
    }

    if (errors.length > 0) throw errors[0]
  }

  export function clear(type?: string): void {
    if (type !== undefined) {
      listeners.delete(type)
      registry.delete(type)
    } else {
      listeners.clear()
      registry.clear()
    }
  }
}
