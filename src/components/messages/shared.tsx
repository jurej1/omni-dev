import { createTextAttributes, SyntaxStyle } from "@opentui/core";

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

export const syntaxStyle = SyntaxStyle.fromTheme([
  // Keywords, control flow
  {
    scope: ["keyword", "keyword.control", "keyword.operator", "storage.type", "storage.modifier"],
    style: { foreground: "#D2A8FF", bold: true },
  },
  // Functions, methods
  {
    scope: ["entity.name.function", "support.function", "meta.function-call"],
    style: { foreground: "#79C0FF" },
  },
  // Types, classes
  {
    scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
    style: { foreground: "#F0883E" },
  },
  // Strings
  {
    scope: ["string", "string.quoted"],
    style: { foreground: "#7EE787" },
  },
  // Numbers, constants
  {
    scope: ["constant.numeric", "constant.language", "constant.character"],
    style: { foreground: "#F0883E" },
  },
  // Comments
  {
    scope: ["comment", "comment.line", "comment.block"],
    style: { foreground: "#6e7681", italic: true },
  },
  // Variables, parameters
  {
    scope: ["variable", "variable.parameter", "variable.other"],
    style: { foreground: "#E6EDF3" },
  },
  // Punctuation
  {
    scope: ["punctuation", "meta.brace"],
    style: { foreground: "#8B949E" },
  },
  // Markdown headings
  {
    scope: ["markup.heading", "entity.name.section"],
    style: { foreground: "#79C0FF", bold: true },
  },
  // Markdown bold
  {
    scope: ["markup.bold"],
    style: { foreground: "#E6EDF3", bold: true },
  },
  // Markdown italic
  {
    scope: ["markup.italic"],
    style: { foreground: "#E6EDF3", italic: true },
  },
  // Markdown inline code
  {
    scope: ["markup.inline.raw", "markup.raw"],
    style: { foreground: "#7EE787" },
  },
  // Markdown links
  {
    scope: ["markup.underline.link", "string.other.link"],
    style: { foreground: "#D2A8FF", underline: true },
  },
  // Markdown list markers
  {
    scope: ["punctuation.definition.list"],
    style: { foreground: "#F0883E" },
  },
  // Operators
  {
    scope: ["keyword.operator", "punctuation.separator"],
    style: { foreground: "#D29922" },
  },
  // Properties
  {
    scope: ["variable.other.property", "support.type.property-name"],
    style: { foreground: "#79C0FF" },
  },
  // Tags (HTML/JSX)
  {
    scope: ["entity.name.tag"],
    style: { foreground: "#7EE787" },
  },
  // Attributes
  {
    scope: ["entity.other.attribute-name"],
    style: { foreground: "#D2A8FF" },
  },
]);

export type ToolCategory =
  | "filesystem"
  | "shell"
  | "network"
  | "ai"
  | "meta"
  | "unknown";

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
