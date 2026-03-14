import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, WebfetchOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function WebfetchOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    Tool.parseOutput(WebfetchOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    const ct = result()?.contentType ?? "";
    const bytes = result()?.content?.length ?? 0;
    return `${bytes} chars (${ct})`;
  });
  return <ToolOutputBox icon="↗" summary={summary()} />;
}
