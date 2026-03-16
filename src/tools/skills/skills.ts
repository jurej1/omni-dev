import { tool } from "@openrouter/sdk";
import z from "zod";
import { tools } from "..";

export const skillsTool = tool({
  name: "list_skills",
  description: "Lists all available skills.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    tools: z.array(z.any()),
  }),
  execute: async () => {
    return { tools: tools };
  },
});
