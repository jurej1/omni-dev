import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, BashOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";
import { truncateLines, detectLanguage, syntaxStyle } from "./shared";

export function BashOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    Tool.parseOutput(BashOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    if (result()?.timedOut) return "timed out";
    const code = result()?.exitCode;
    const preview = (result()?.output ?? "").slice(0, 60).replace(/\n/g, " ");
    return `exit ${code ?? "?"} — ${preview || "(no output)"}`;
  });
  const preview = createMemo(() => {
    const out = result()?.output ?? "";
    if (!out.trim()) return "";
    return truncateLines(out, 15);
  });
  const lang = createMemo(() => detectLanguage(preview()));
  return (
    <ToolOutputBox icon="$" summary={summary()}>
      <box
        paddingLeft={3}
        paddingTop={1}
        paddingBottom={1}
        maxHeight={12}
        gap={1}
      >
        <syntax language={lang()} syntaxStyle={syntaxStyle}>
          {preview()}
        </syntax>
      </box>
    </ToolOutputBox>
  );
}
