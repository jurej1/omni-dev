export namespace FileScanner {
  const IGNORE = [
    "node_modules",
    ".git",
    "dist",
    "build",
    "target",
    ".cache",
    "coverage",
  ];

  let cachedFiles: string[] | null = null;

  export async function scanFiles(cwd: string): Promise<string[]> {
    if (cachedFiles) return cachedFiles;

    const glob = new Bun.Glob("**/*");
    const results: string[] = [];

    for await (const file of glob.scan({ cwd, onlyFiles: true })) {
      if (IGNORE.some((p) => file.startsWith(p + "/"))) continue;
      results.push(file);
      if (results.length >= 500) break;
    }

    cachedFiles = results;
    return results;
  }
}
