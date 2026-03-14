import { z } from "zod";

import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { tool } from "@openrouter/sdk";

export const WriteInputSchema = z.object({
  filePath: z.string().describe("Absolute or relative path to write to"),
  content: z.string().describe("Content to write to the file"),
});
export type WriteInput = z.infer<typeof WriteInputSchema>;

export const WriteOutputSchema = z.object({
  path: z.string(),
  bytesWritten: z.number(),
});
export type WriteOutput = z.infer<typeof WriteOutputSchema>;

export const writeTool = tool({
  name: "write",
  description: "Write content to a file, creating parent directories as needed",
  inputSchema: WriteInputSchema,
  outputSchema: WriteOutputSchema,
  execute: async ({ filePath, content }) => {
    await mkdir(dirname(filePath), { recursive: true });
    await Bun.write(filePath, content);
    return { path: filePath, bytesWritten: content.length };
  },
});
