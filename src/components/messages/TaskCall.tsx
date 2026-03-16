import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, TaskInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function TaskCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(TaskInputSchema, props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="TASK"
      label={args().description ?? args().subagent_type ?? ""}
      detail={args().subagent_type}
      status={props.message.status}
    />
  );
}
