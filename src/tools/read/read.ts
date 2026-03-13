import { tool } from "@openrouter/sdk";
import z from "zod";
import DESCRIPTION from "./read.txt";

export const readTool = tool({
  name: "read",
  description: DESCRIPTION,
  inputSchema: z.object({
    filePath: z
      .string()
      .describe("The absolute path to the file or directory to read"),
  }),
  outputSchema: z.object({
    text: z.string().describe("The contents of the file"),
  }),

  execute: async ({ filePath }) => {
    const file = Bun.file(filePath);
    const text = await file.text();
    return { text: text };
  },
});
