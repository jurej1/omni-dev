import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, EditInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function EditCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(EditInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => (args().replaceAll ? "(replaceAll)" : ""));
  return (
    <ToolCallBox
      icon="✎"
      label={args().filePath ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}
