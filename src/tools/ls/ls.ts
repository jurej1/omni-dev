import { z } from "zod";

import { readdir } from "node:fs/promises";
import { join, resolve, basename, dirname } from "node:path";
import { tool } from "@openrouter/sdk";
import * as DESCRIPTION from "./ls.txt";

const IGNORE_PATTERNS = new Set([
  "node_modules",
  "__pycache__",
  ".git",
  "dist",
  "build",
  "target",
  "vendor",
  "bin",
  "obj",
  ".idea",
  ".vscode",
  ".zig-cache",
  "zig-out",
  ".coverage",
  "coverage",
  "tmp",
  "temp",
  ".cache",
  "cache",
  "logs",
  ".venv",
  "venv",
  "env",
]);

const LIMIT = 100;

export const listTool = tool({
  name: "list",
  description: DESCRIPTION,
  inputSchema: z.object({
    path: z
      .string()
      .optional()
      .describe(
        "The absolute path to the directory to list. Defaults to current working directory.",
      ),
    ignore: z
      .array(z.string())
      .optional()
      .describe("Additional directory names to ignore"),
  }),
  outputSchema: z.object({
    tree: z.string(),
    truncated: z.boolean(),
  }),
  execute: async ({ path: searchPath, ignore }) => {
    const dir = resolve(searchPath ?? process.cwd());
    const extraIgnore = new Set<string>(ignore ?? []);

    const files: string[] = [];
    await collectFiles(dir, dir, files, extraIgnore);

    if (files.length === 0)
      return { tree: `${dir}/\n  (empty)`, truncated: false };

    const truncated = files.length >= LIMIT;
    const shown = truncated ? files.slice(0, LIMIT) : files;

    const dirs = new Set<string>();
    const filesByDir = new Map<string, string[]>();

    for (const file of shown) {
      const relDir = dirname(file);
      const parts = relDir === "." ? [] : relDir.split("/");

      for (let i = 0; i <= parts.length; i++) {
        dirs.add(i === 0 ? "." : parts.slice(0, i).join("/"));
      }

      if (!filesByDir.has(relDir)) filesByDir.set(relDir, []);
      filesByDir.get(relDir)!.push(basename(file));
    }

    const renderDir = (dirPath: string, depth: number): string => {
      const indent = "  ".repeat(depth);
      let out = depth > 0 ? `${indent}${basename(dirPath)}/\n` : "";
      const childIndent = "  ".repeat(depth + 1);

      const children = Array.from(dirs)
        .filter((d) => dirname(d) === dirPath && d !== dirPath)
        .sort();

      for (const child of children) {
        out += renderDir(child, depth + 1);
      }

      for (const f of (filesByDir.get(dirPath) ?? []).sort()) {
        out += `${childIndent}${f}\n`;
      }

      return out;
    };

    let tree = `${dir}/\n` + renderDir(".", 0);
    if (truncated) {
      tree += `\n(Showing first ${LIMIT} files. Directory may contain more.)`;
    }

    return { tree, truncated };
  },
});

async function collectFiles(
  baseDir: string,
  dir: string,
  results: string[],
  extraIgnore: Set<string>,
): Promise<void> {
  if (results.length >= LIMIT) return;

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (results.length >= LIMIT) break;
    if (IGNORE_PATTERNS.has(entry.name) || extraIgnore.has(entry.name))
      continue;

    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(baseDir, full, results, extraIgnore);
    } else {
      const relative = full.slice(baseDir.length + 1);
      results.push(relative);
    }
  }
}
