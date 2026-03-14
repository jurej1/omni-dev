import { tool } from "@openrouter/sdk";

import z from "zod";

export const ReadInputSchema = z.object({
  filePath: z.string().describe("The absolute path to the file to read"),
  offset: z.coerce
    .number()
    .describe("The line number to start reading from (1-indexed)")
    .optional(),
  limit: z.coerce
    .number()
    .describe("The maximum number of lines to read (defaults to 2000)")
    .optional(),
});
export type ReadInput = z.infer<typeof ReadInputSchema>;

export const ReadMetadataSchema = z.object({
  preview: z.string(),
  truncated: z.boolean(),
  loaded: z.array(z.string()),
  name: z.string().optional(),
});
export type ReadMetadata = z.infer<typeof ReadMetadataSchema>;

export const ReadOutputSchema = z.object({
  output: z.string(),
});
export type ReadOutput = z.infer<typeof ReadOutputSchema>;

export const readTool = tool({
  name: "read",
  description: "Read the contents of a file",
  inputSchema: ReadInputSchema,
  outputSchema: ReadOutputSchema,
  execute: async (params) => {
    const text = await Bun.file(params.filePath).text();
    return { output: text };
  },
});
