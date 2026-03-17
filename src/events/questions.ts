import { z } from "zod"
import { Bus } from "../utils/bus"

const QuestionsSchema = z.array(z.string())
type Questions = z.infer<typeof QuestionsSchema>

Bus.register("questions:ask", QuestionsSchema)
Bus.register("questions:answers", QuestionsSchema)

export function publishQuestionsAsk(questions: Questions): void {
  Bus.publish("questions:ask", questions)
}

export function subscribeQuestionsAsk(callback: (questions: Questions) => void): () => void {
  return Bus.subscribe<Questions>("questions:ask", callback)
}

export function publishQuestionsAnswers(answers: Questions): void {
  Bus.publish("questions:answers", answers)
}

export function subscribeQuestionsAnswers(callback: (answers: Questions) => void): () => void {
  return Bus.subscribe<Questions>("questions:answers", callback)
}
