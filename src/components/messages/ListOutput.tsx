import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, ListOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function ListOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    Tool.parseOutput(ListOutputSchema, props.message.output),
  );
  const summary = createMemo(
    () => `listed${result()?.truncated ? " (truncated)" : ""}`,
  );
  return <ToolOutputBox icon="≡" summary={summary()} />;
}
