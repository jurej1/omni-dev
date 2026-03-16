import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolOutputBox } from "./ToolOutputBox";

export function TaskOutput(props: { message: FunctionCallOutputMessage }) {
  const summary = createMemo(() => {
    try {
      const parsed = JSON.parse(props.message.output) as {
        task_id?: string;
        result?: string;
      };
      const preview = parsed.result?.slice(0, 80) ?? "";
      return preview || "done";
    } catch {
      return props.message.output.slice(0, 80);
    }
  });
  return <ToolOutputBox icon="TASK" summary={summary()} />;
}
