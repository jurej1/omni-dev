import { tool } from "@openrouter/sdk";
import z from "zod";
import { resolve } from "node:path";

const DEFAULT_LIMIT = 2000;

export const ReadInputSchema = z.object({
  filePath: z.string().describe("The absolute path to the file to read"),
  offset: z.coerce.number().int().min(1).describe("The line number to start reading from (1-indexed)").optional(),
  limit: z.coerce.number().int().min(1).describe("The maximum number of lines to read (defaults to 2000)").optional(),
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
    const filePath = resolve(params.filePath);
    const startLine = params.offset ?? 1;
    const maxLines = params.limit ?? DEFAULT_LIMIT;

    const proc = Bun.spawn(
      ["rg", "--no-config", "--line-number", "--passthru", "--regexp", "^", filePath],
      { stdout: "pipe", stderr: "pipe" },
    );

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    // exitCode 1 = no match (empty file), 2 = error
    if (exitCode === 2) {
      throw new Error(`Failed to read file "${filePath}": ${stderr.trim()}`);
    }

    const rawLines = stdout.split(/\r?\n/);

    // rg --line-number output format: "<lineNum>:<content>"
    const parsed: { lineNum: number; content: string }[] = [];
    for (const raw of rawLines) {
      if (!raw) continue;
      const colonIdx = raw.indexOf(":");
      if (colonIdx === -1) continue;
      const lineNum = parseInt(raw.slice(0, colonIdx), 10);
      if (isNaN(lineNum)) continue;
      const content = raw.slice(colonIdx + 1);
      parsed.push({ lineNum, content });
    }

    // apply offset (1-indexed) and limit
    const window = parsed
      .filter((l) => l.lineNum >= startLine)
      .slice(0, maxLines);

    const output = window
      .map(({ lineNum, content }) => `${String(lineNum).padStart(6)}→${content}`)
      .join("\n");

    return { output };
  },
});
