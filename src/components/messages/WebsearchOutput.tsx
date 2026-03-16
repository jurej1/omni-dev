import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolUtil, WebsearchOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function WebsearchOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    ToolUtil.parseOutput(WebsearchOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    const chars = result()?.results?.length ?? 0;
    return chars > 0 ? `${chars} chars returned` : "no results";
  });
  return <ToolOutputBox icon="⌖" summary={summary()} />;
}
