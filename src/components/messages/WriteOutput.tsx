import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { Tool, WriteOutputSchema } from "../../tools";
import { normalizePath } from "./shared";
import { ToolOutputBox } from "./ToolOutputBox";

export function WriteOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    Tool.parseOutput(WriteOutputSchema, props.message.output),
  );
  const summary = createMemo(
    () =>
      `wrote ${normalizePath(result()?.path ?? "")} (${result()?.bytesWritten ?? 0} bytes)`,
  );
  return <ToolOutputBox icon="+" summary={summary()} />;
}
