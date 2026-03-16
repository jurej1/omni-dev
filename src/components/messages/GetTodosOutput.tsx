import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolUtil, GetTodosOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function GetTodosOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    ToolUtil.parseOutput(GetTodosOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    const count = result()?.todos?.length ?? 0;
    return `${count} todos`;
  });
  return <ToolOutputBox icon="✓" summary={summary()} />;
}
