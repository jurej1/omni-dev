import { z } from "zod";
import { resolve } from "node:path";
import { tool } from "@openrouter/sdk";
import * as DESCRIPTION from "./grep.txt";

const MAX_LINE_LENGTH = 2000;
const LIMIT = 100;

export const grepTool = tool({
  name: "grep",
  description: DESCRIPTION,
  inputSchema: z.object({
    pattern: z
      .string()
      .describe("The regex pattern to search for in file contents"),
    path: z
      .string()
      .optional()
      .describe(
        "The directory to search in. Defaults to the current working directory.",
      ),
    include: z
      .string()
      .optional()
      .describe(
        'File glob pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")',
      ),
  }),
  outputSchema: z.object({
    matches: z.array(
      z.object({
        path: z.string(),
        lineNum: z.number(),
        lineText: z.string(),
      }),
    ),
    total: z.number(),
    truncated: z.boolean(),
  }),
  execute: async ({ pattern, path: searchPath, include }) => {
    if (!pattern) throw new Error("pattern is required");

    const dir = resolve(searchPath ?? process.cwd());
    const args = [
      "-nH",
      "--hidden",
      "--no-messages",
      "--field-match-separator=|",
      "--regexp",
      pattern,
    ];

    if (include) {
      args.push("--glob", include);
    }
    args.push(dir);

    const proc = Bun.spawn(["rg", ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const [stdout, , exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    if (exitCode === 1 || (exitCode === 2 && !stdout.trim())) {
      return { matches: [], total: 0, truncated: false };
    }

    const lines = stdout.trim().split(/\r?\n/);
    const allMatches: { path: string; lineNum: number; lineText: string }[] =
      [];

    for (const line of lines) {
      if (!line) continue;
      const [filePath, lineNumStr, ...lineTextParts] = line.split("|");
      if (!filePath || !lineNumStr || lineTextParts.length === 0) continue;
      const lineText = lineTextParts.join("|");
      allMatches.push({
        path: filePath,
        lineNum: parseInt(lineNumStr, 10),
        lineText:
          lineText.length > MAX_LINE_LENGTH
            ? lineText.substring(0, MAX_LINE_LENGTH) + "..."
            : lineText,
      });
    }

    const truncated = allMatches.length > LIMIT;
    return {
      matches: truncated ? allMatches.slice(0, LIMIT) : allMatches,
      total: allMatches.length,
      truncated,
    };
  },
});
