import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, GlobInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function GlobCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(GlobInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => (args().path ? `in ${args().path}` : ""));
  return (
    <ToolCallBox
      icon="*"
      name="GLOB"
      label={args().pattern ?? ""}
      detail={detail()}
      status={props.message.status}
      type="filesystem"
    />
  );
}
