import { createMemo } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolUtil, WebsearchInputSchema } from "../../tools";
import { ToolCallBox } from "./ToolCallBox";

export function WebsearchCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    ToolUtil.parseInput(WebsearchInputSchema, props.message.arguments),
  );
  const detail = createMemo(() => {
    const parts: string[] = [];
    if (args().type && args().type !== "auto") parts.push(args().type!);
    if (args().numResults) parts.push(`n=${args().numResults}`);
    return parts.join(" ");
  });
  return (
    <ToolCallBox
      icon="⌖"
      name="WEBSEARCH"
      label={args().query ?? ""}
      detail={detail()}
      status={props.message.status}
      type="network"
    />
  );
}
