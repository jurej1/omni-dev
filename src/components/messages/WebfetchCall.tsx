import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, WebfetchInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function WebfetchCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(WebfetchInputSchema, props.message.arguments),
  );
  const detail = createMemo(() =>
    args().format && args().format !== "markdown" ? `(${args().format})` : "",
  );
  return (
    <ToolCallBox
      icon="↗"
      label={args().url ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}
