import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, ListInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function ListCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(ListInputSchema, props.message.arguments),
  );
  const cwd = process.cwd();
  return (
    <ToolCallBox
      icon="≡"
      label={args().path ?? cwd}
      status={props.message.status}
    />
  );
}
