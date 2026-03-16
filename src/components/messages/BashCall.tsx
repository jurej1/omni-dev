import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { BashInputSchema, ToolUtil } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function BashCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(BashInputSchema, props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="$"
      name="BASH"
      label={args().command ?? ""}
      status={props.message.status}
      type="shell"
    />
  );
}
