import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, ListInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function ListCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(ListInputSchema, props.message.arguments),
  );
  const cwd = process.cwd();
  return (
    <ToolCallBox
      icon="≡"
      name="LIST"
      label={args().path ?? cwd}
      status={props.message.status}
      type="filesystem"
    />
  );
}
