import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, EditInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function EditCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(EditInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => (args().replaceAll ? "(replaceAll)" : ""));
  return (
    <ToolCallBox
      icon="✎"
      name="EDIT"
      label={args().filePath ?? ""}
      detail={detail()}
      status={props.message.status}
      type="filesystem"
    />
  );
}
