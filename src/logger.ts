import { openSync, writeSync, writeFileSync } from "fs";
import { join } from "path";

const LOG_PATH = join(process.cwd(), "omni-dev.log");

writeFileSync(LOG_PATH, "");

const fd = openSync(LOG_PATH, "a");

function formatLine(level: string, args: unknown[]): string {
  const timestamp = new Date().toISOString();
  const message = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
    .join(" ");
  return `[${timestamp}] [${level.padEnd(5)}] ${message}\n`;
}

export const logger = {
  log: (...args: unknown[]) => writeSync(fd, formatLine("LOG", args)),
  error: (...args: unknown[]) => writeSync(fd, formatLine("ERROR", args)),
  debug: (...args: unknown[]) => writeSync(fd, formatLine("DEBUG", args)),
};
