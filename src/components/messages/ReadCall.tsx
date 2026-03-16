import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, ReadInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function ReadCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(ReadInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => "");
  return (
    <ToolCallBox
      icon="→"
      label={args().filePath ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}
