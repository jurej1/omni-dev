import { tool } from "@openrouter/sdk";
import * as DESCRIPTION from "./bash.txt";

import z from "zod";

const DEFAULT_TIMEOUT_MS = 30000;

export const bashTool = tool({
  name: "bash",
  description: DESCRIPTION,
  inputSchema: z.object({
    command: z.string().describe("Shell command to execute"),
    timeoutMs: z
      .number()
      .optional()
      .describe("Timeout in milliseconds (default: 30000)"),
  }),
  outputSchema: z.object({
    output: z.string().describe("Command output"),
    exitCode: z.number().describe("Exit code"),
    timedOut: z.boolean().describe("Whether the command timed out"),
  }),
  execute: async ({ command, timeoutMs = DEFAULT_TIMEOUT_MS }) => {
    const proc = Bun.spawn(["bash", "-c", command], {
      stdout: "pipe",
      stderr: "pipe",
    });

    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      proc.kill();
    }, timeoutMs);

    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);

    clearTimeout(timer);

    if (killed) {
      return {
        output: `Command timed out after ${timeoutMs}ms: ${command}`,
        exitCode: -1,
        timedOut: true,
      };
    }

    const output = [stdout, stderr].filter(Boolean).join("\n") || "(no output)";
    return { output, exitCode, timedOut: false };
  },
});
