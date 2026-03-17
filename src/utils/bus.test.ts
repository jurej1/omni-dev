import { describe, it, expect, beforeEach } from "bun:test"
import { z } from "zod"
import { Bus } from "./bus"

describe("Bus.register + publish validation", () => {
  beforeEach(() => Bus.clear())

  it("passes valid payload through publish", () => {
    Bus.register("test:event", z.array(z.string()))
    let received: string[] | undefined
    Bus.subscribe<string[]>("test:event", (d) => { received = d })
    Bus.publish("test:event", ["hello"])
    expect(received).toEqual(["hello"])
  })

  it("throws ZodError on publish with invalid payload", () => {
    Bus.register("test:event", z.array(z.string()))
    expect(() => Bus.publish("test:event", 42 as unknown as string[])).toThrow()
  })

  // Note: subscriber-side validation (the wrapped callback) is a secondary safety net.
  // It cannot be tested through the public API alone since publish validates first.
  // The wrapped callback protects against payloads injected via unregistered publish paths.

  it("skips validation for unregistered events", () => {
    let received: unknown
    Bus.subscribe<unknown>("test:unregistered", (d) => { received = d })
    Bus.publish("test:unregistered", { anything: true })
    expect(received).toEqual({ anything: true })
  })

  it("unsubscribe still works", () => {
    Bus.register("test:event", z.array(z.string()))
    let count = 0
    const unsub = Bus.subscribe<string[]>("test:event", () => { count++ })
    Bus.publish("test:event", ["a"])
    unsub()
    Bus.publish("test:event", ["b"])
    expect(count).toBe(1)
  })
})
