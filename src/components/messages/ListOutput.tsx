import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolUtil, ListOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";

export function ListOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    ToolUtil.parseOutput(ListOutputSchema, props.message.output),
  );
  const fileCount = createMemo(() => {
    const tree = result()?.tree;
    if (!tree) return 0;
    return tree
      .split("\n")
      .filter((line) => line.trim() && !line.trim().endsWith("/") && !line.startsWith("("))
      .length;
  });
  const summary = createMemo(
    () => `listed ${fileCount()} file${fileCount() === 1 ? "" : "s"}${result()?.truncated ? " (truncated)" : ""}`,
  );
  return <ToolOutputBox icon="≡" summary={summary()} />;
}
