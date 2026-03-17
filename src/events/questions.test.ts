import { describe, it, expect, beforeEach } from "bun:test"
import { z } from "zod"
import { Bus } from "../utils/bus"
import {
  publishQuestionsAsk,
  publishQuestionsAnswers,
  subscribeQuestionsAsk,
  subscribeQuestionsAnswers,
} from "./questions"

describe("questions events", () => {
  beforeEach(() => {
    Bus.clear()
    // Re-register schemas since clear() wipes the registry (set once at module load in questions.ts)
    Bus.register("questions:ask", z.array(z.string()))
    Bus.register("questions:answers", z.array(z.string()))
  })

  it("publishQuestionsAsk dispatches string array", () => {
    let received: string[] | undefined
    subscribeQuestionsAsk((qs) => { received = qs })
    publishQuestionsAsk(["Q1", "Q2"])
    expect(received).toEqual(["Q1", "Q2"])
  })

  it("publishQuestionsAnswers dispatches string array", () => {
    let received: string[] | undefined
    subscribeQuestionsAnswers((as) => { received = as })
    publishQuestionsAnswers(["A1", "A2"])
    expect(received).toEqual(["A1", "A2"])
  })

  it("publishQuestionsAsk throws on invalid payload", () => {
    expect(() => publishQuestionsAsk([1, 2] as unknown as string[])).toThrow()
  })

  it("subscribeQuestionsAsk returns unsubscribe function", () => {
    let count = 0
    const unsub = subscribeQuestionsAsk(() => { count++ })
    publishQuestionsAsk(["q"])
    unsub()
    publishQuestionsAsk(["q2"])
    expect(count).toBe(1)
  })
})
