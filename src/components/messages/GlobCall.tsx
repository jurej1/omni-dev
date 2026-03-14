import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, GlobInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function GlobCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(GlobInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => (args().path ? `in ${args().path}` : ""));
  return (
    <ToolCallBox
      icon="*"
      label={args().pattern ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}
