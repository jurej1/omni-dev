import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, WriteInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function WriteCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(WriteInputSchema, props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="+"
      name="WRITE"
      label={args().filePath ?? ""}
      status={props.message.status}
      type="filesystem"
    />
  );
}
