import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolUtil, GlobOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function GlobOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    ToolUtil.parseOutput(GlobOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    const count = result()?.files?.length ?? 0;
    const trunc = result()?.truncated ? "+" : "";
    return `${count}${trunc} file${count !== 1 ? "s" : ""}`;
  });
  return <ToolOutputBox icon="*" summary={summary()} />;
}
