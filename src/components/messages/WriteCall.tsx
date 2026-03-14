import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, WriteInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function WriteCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(WriteInputSchema, props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="+"
      label={args().filePath ?? ""}
      status={props.message.status}
    />
  );
}
