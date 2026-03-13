import { z } from "zod";

import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { tool } from "@openrouter/sdk";
import * as DESCRIPTION from "./write.txt";

export const writeTool = tool({
  name: "write",
  description: DESCRIPTION,
  inputSchema: z.object({
    filePath: z.string().describe("Absolute or relative path to write to"),
    content: z.string().describe("Content to write to the file"),
  }),
  outputSchema: z.object({
    path: z.string(),
    bytesWritten: z.number(),
  }),
  execute: async ({ filePath, content }) => {
    await mkdir(dirname(filePath), { recursive: true });
    await Bun.write(filePath, content);
    return { path: filePath, bytesWritten: content.length };
  },
});
