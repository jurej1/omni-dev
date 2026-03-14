import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, GrepOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function GrepOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    Tool.parseOutput(GrepOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    const total = result()?.total ?? 0;
    const trunc = result()?.truncated ? "+" : "";
    return `${total}${trunc} match${total !== 1 ? "es" : ""}`;
  });
  return <ToolOutputBox icon="⌕" summary={summary()} />;
}
