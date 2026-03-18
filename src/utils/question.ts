import z from "zod";
import { BusEvent } from "./bus/bus-event";
import { Bus } from "./bus/bus";

export namespace Question {
  export const Reply = z.object({
    answers: z.array(z.string()).describe("List of answers to questions"),
  });

  export type Reply = z.infer<typeof Reply>;

  export const Request = z.object({
    questions: z.array(z.string()).min(1).describe("Questions to ask."),
  });

  export type Request = z.infer<typeof Request>;

  export const Event = {
    Asked: BusEvent.define("question.asked", Request),
    Reply: BusEvent.define("question.reply", Reply),
  };

  export async function ask(questions: string[]): Promise<string[]> {
    return new Promise((resolve) => {
      Bus.publish(Event.Asked, { questions });

      const unsub = Bus.subscribe(Event.Reply, (answers) => {
        const data = answers.properties.answers;
        unsub();
        resolve(data);
      });
    });
  }
}
