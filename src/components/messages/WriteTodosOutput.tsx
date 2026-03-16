import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolUtil, WriteTodosOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function WriteTodosOutput(props: {
  message: FunctionCallOutputMessage;
}) {
  const result = createMemo(() =>
    ToolUtil.parseOutput(WriteTodosOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    const count = result()?.count ?? 0;
    return `${count} todos saved`;
  });
  return <ToolOutputBox icon="✓" summary={summary()} />;
}
