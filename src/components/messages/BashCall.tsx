import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, BashInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function BashCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(BashInputSchema, props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="$"
      label={args().command ?? ""}
      status={props.message.status}
    />
  );
}
