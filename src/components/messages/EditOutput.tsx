import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, EditOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function EditOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    Tool.parseOutput(EditOutputSchema, props.message.output),
  );
  const summary = createMemo(() =>
    result()?.success
      ? `${result()?.replacements ?? 1} replacement(s) made`
      : "edit failed",
  );
  return <ToolOutputBox icon="✎" summary={summary()} />;
}
