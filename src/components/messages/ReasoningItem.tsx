import { createMemo } from "solid-js";
import type { ReasoningMessage } from "../../messages";
import { theme } from "./shared";

export function ReasoningItem(props: { message: ReasoningMessage }) {
  const content = createMemo(() => {
    const text = props.message.summary
      .filter((s) => s.type === "summary_text")
      .map((s) => (s as { type: "summary_text"; text: string }).text)
      .join("");
    return `[thinking] ${text}`;
  });

  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundMenu}
      borderColor={theme.background}
    >
      <text paddingLeft={3} fg={theme.textMuted}>
        🤔 {content()}
      </text>
    </box>
  );
}
