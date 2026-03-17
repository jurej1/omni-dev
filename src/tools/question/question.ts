import { tool } from "@openrouter/sdk";
import { z } from "zod";
import { publishQuestionsAsk, subscribeQuestionsAnswers } from "../../events";

export const QuestionInputSchema = z.object({
  questions: z.array(z.string()).min(1).describe("List of questions to ask the user"),
});
export type QuestionInput = z.infer<typeof QuestionInputSchema>;

export const QuestionOutputSchema = z.object({
  answers: z.array(z.string()).describe("User answers in the same order as questions"),
});
export type QuestionOutput = z.infer<typeof QuestionOutputSchema>;

export const questionTool = tool({
  name: "AskUserQuestion",
  description: "Ask the user one or more questions and wait for their answers before continuing.",
  inputSchema: QuestionInputSchema,
  outputSchema: QuestionOutputSchema,
  execute: async ({ questions }) => {
    const answers = await new Promise<string[]>((resolve) => {
      const unsub = subscribeQuestionsAnswers((data) => {
        unsub();
        resolve(data);
      });

      publishQuestionsAsk(questions);
    });

    return { answers };
  },
});
