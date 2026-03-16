import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, GrepInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function GrepCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(GrepInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => {
    const parts: string[] = [];
    if (args().path) parts.push(`in ${args().path}`);
    if (args().include) parts.push(`[${args().include}]`);
    return parts.join(" ");
  });
  return (
    <ToolCallBox
      icon="⌕"
      label={args().pattern ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}
