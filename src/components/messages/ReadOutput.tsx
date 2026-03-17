import { createMemo } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";

import { ToolOutputBox } from "./ToolOutputBox";

export function ReadOutput(props: { message: FunctionCallOutputMessage }) {
  const preview = createMemo(() => {
    const content = props.message.output.slice(0, 4000);
    const lines = content.split("\n");
    const maxPreviewLines = 20;
    const previewLines = lines.slice(0, maxPreviewLines).map((line, index) => {
      const num = String(index + 1).padStart(2, " ") + ": ";
      const truncatedLine = line.length > 180 ? line.slice(0, 180) + "…" : line;
      return num + truncatedLine;
    });
    return (
      previewLines.join("\n") +
      (lines.length > maxPreviewLines ? "\n… (truncated)" : "")
    );
  });
  return (
    <ToolOutputBox icon="📄" summary="File contents (preview)">
      <box paddingLeft={3} paddingTop={1} paddingBottom={1} maxHeight={15}>
        <text>{preview()}</text>
      </box>
    </ToolOutputBox>
  );
}
