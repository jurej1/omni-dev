import { z } from "zod";

import { resolve } from "node:path";
import { files, tool } from "@openrouter/sdk";
import * as DESCRIPTION from "./glob.txt";

const LIMIT = 100;

export const globTool = tool({
  name: "glob",
  description: DESCRIPTION,
  inputSchema: z.object({
    pattern: z.string().describe("The glob pattern to match files against"),
    path: z
      .string()
      .optional()
      .describe(
        "The directory to search in. Defaults to current working directory. Must be an absolute path if provided.",
      ),
  }),
  outputSchema: z.object({
    files: z.array(z.string()),
    truncated: z.boolean(),
  }),
  execute: async ({ pattern, path: searchPath }) => {
    const dir = resolve(searchPath ?? process.cwd());
    const glob = new Bun.Glob(pattern);

    const files: { path: string; mtime: number }[] = [];
    for await (const match of glob.scan({
      cwd: dir,
      dot: true,
      absolute: false,
    })) {
      if (files.length >= LIMIT) break;
      const absPath = `${dir}/${match}`;
      const f = Bun.file(absPath);
      const stat = await f.stat();
      files.push({ path: absPath, mtime: stat.mtimeMs });
    }

    files.sort((a, b) => b.mtime - a.mtime);

    return {
      files: files.map((f) => f.path),
      truncated: files.length >= LIMIT,
    };
  },
});
