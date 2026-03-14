import { SyntaxStyle, RGBA, createTextAttributes } from "@opentui/core";

export const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.3": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
});

export const bold = createTextAttributes({ bold: true });

export const theme = {
  text: "#E6EDF3",
  textMuted: "#8B949E",
  background: "#010409",
  backgroundPanel: "#0D1117",
  backgroundMenu: "#161B22",
  error: "#FF7B72",
  warning: "#D29922",
};

export function normalizePath(filepath: string): string {
  const cwd = process.cwd();
  if (filepath.startsWith(cwd)) {
    return filepath.slice(cwd.length).replace(/^\//, "");
  }
  return filepath;
}
