import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { Tool, ReadInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function ReadCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    Tool.parseInput(ReadInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => {
    const extra: string[] = [];
    if (args().offset !== undefined) extra.push(`offset=${args().offset}`);
    if (args().limit !== undefined) extra.push(`limit=${args().limit}`);
    return extra.length ? `(${extra.join(", ")})` : "";
  });
  return (
    <ToolCallBox
      icon="→"
      label={args().filePath ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}
