import { tool } from "@openrouter/sdk";
import { Question } from "../../utils/question";
import z from "zod";
import DESCRIPTION from "./question.txt";

const QuestionToolOutputSchema = z.object({
  title: z.string(),
  output: z.string(),
  answers: z.array(z.string()),
});

export const questionTool = tool({
  name: "question",
  description: DESCRIPTION,
  inputSchema: Question.Request,
  outputSchema: QuestionToolOutputSchema,
  execute: async (params) => {
    const answers = await Question.ask(params.questions);

    function format(answer: string) {
      if (answer.length === 0) return "Unanwsered";
      return answers.join(", ");
    }

    const formatted = params.questions
      .map((q, i) => `"${q}"="${format(answers[i])}"`)
      .join(", ");

    return {
      title: `Asked ${params.questions.length} question${
        params.questions.length > 1 ? "s" : ""
      }`,
      output: `User has answered your questions: ${formatted}. You can now continue with the user's answers in mind.`,
      answers: answers,
    };
  },
});
