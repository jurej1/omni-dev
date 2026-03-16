import { SyntaxStyle, RGBA, createTextAttributes } from "@opentui/core";

export const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.3": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  string: { fg: RGBA.fromHex("#7EE787") },
  property: { fg: RGBA.fromHex("#79C0FF") },
  number: { fg: RGBA.fromHex("#D2A8FF") },
  comment: { fg: RGBA.fromHex("#8B949E") },
  keyword: { fg: RGBA.fromHex("#FF7B72") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
});

export const bold = createTextAttributes({ bold: true });
export const dim = createTextAttributes({ dim: true });
export const italic = createTextAttributes({ italic: true });
export const dimItalic = createTextAttributes({ dim: true, italic: true });

export const theme = {
  text: "#E6EDF3",
  textMuted: "#8B949E",
  background: "#010409",
  backgroundPanel: "#0D1117",
  backgroundMenu: "#161B22",
  error: "#FF7B72",
  warning: "#D29922",
  accentUser: "#3FB950",
  accentDimGray: "#6e7681",
  accentBlue: "#79C0FF",
  accentGreen: "#7EE787",
  accentPurple: "#D2A8FF",
  accentOrange: "#F0883E",
  accentAmber: "#D29922",
};

export type ToolCategory = "filesystem" | "shell" | "network" | "ai" | "meta" | "unknown";

export const toolCategoryColor: Record<ToolCategory, string> = {
  filesystem: "#79C0FF",
  shell: "#7EE787",
  network: "#D2A8FF",
  ai: "#F0883E",
  meta: "#D29922",
  unknown: "#8B949E",
};

export function normalizePath(filepath: string): string {
  const cwd = process.cwd();
  if (filepath.startsWith(cwd)) {
    return filepath.slice(cwd.length).replace(/^\\/, "");
  }
  return filepath;
}

export function truncateLines(text: string, maxLines = 10): string {
  const lines = text.split(/\\r?\\n/);
  if (lines.length <= maxLines) return text;
  const truncated = lines.slice(0, maxLines).join("\\n");
  return (
    truncated + "\\n... (" + (lines.length - maxLines) + " lines truncated)"
  );
}

export function detectLanguage(output: string): string {
  const trimmed = output.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return "json";
  if (trimmed.startsWith("$") || trimmed.match(/^\\s*[a-zA-Z0-9_-]+/m))
    return "bash";
  if (trimmed.match(/^\\w+:/)) return "yaml";
  return "text";
}

export function extractArgHint(toolName: string, argsJson: string): string {
  try {
    const args = JSON.parse(argsJson) as Record<string, unknown>;
    const firstVal = Object.values(args)[0];
    const hint = typeof firstVal === "string" ? firstVal : argsJson;
    return `${toolName}(${hint})`;
  } catch {
    return toolName;
  }
}

export function formatJson(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonStr;
  }
}
