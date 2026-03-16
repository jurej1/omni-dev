import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, WriteTodosInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function WriteTodosCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(WriteTodosInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => {
    const count = args().todos?.length ?? 0;
    return count > 0 ? `${count} items` : "";
  });
  return (
    <ToolCallBox
      icon="✓"
      label="write todos"
      detail={detail()}
      status={props.message.status}
    />
  );
}
