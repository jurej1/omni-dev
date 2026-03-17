import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolUtil, BashOutputSchema } from "../../tools";
import { ToolOutputBox } from "./ToolOutputBox";
import { truncateLines } from "./shared";

export function BashOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    ToolUtil.parseOutput(BashOutputSchema, props.message.output),
  );
  const summary = createMemo(() => {
    if (result()?.timedOut) return "timed out";
    const code = result()?.exitCode;
    const preview = (result()?.output ?? "").slice(0, 60).replace(/\n/g, " ");
    return `exit ${code ?? "?"} — ${preview || "(no output)"}`;
  });
  const preview = createMemo(() => {
    const out = result()?.output ?? "";
    if (!out.trim()) return "";
    return truncateLines(out, 15);
  });
  return (
    <ToolOutputBox icon="$" summary={summary()}>
      <box
        paddingLeft={3}
        paddingTop={1}
        paddingBottom={1}
        maxHeight={12}
        gap={1}
      >
        <text>{preview()}</text>
      </box>
    </ToolOutputBox>
  );
}
