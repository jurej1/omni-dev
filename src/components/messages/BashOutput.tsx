import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, BashOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

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
  return <ToolOutputBox icon="$" summary={summary()} />;
}
