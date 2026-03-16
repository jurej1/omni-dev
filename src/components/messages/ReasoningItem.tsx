import { createMemo } from "solid-js";
import type { ReasoningMessage } from "../../messages";
import { theme, dimItalic } from "./shared";

export function ReasoningItem(props: { message: ReasoningMessage }) {
  const content = createMemo(() => {
    const summaryText = (props.message.summary ?? [])
      .filter((s) => s.type === "summary_text")
      .map((s) => (s as { type: "summary_text"; text: string }).text)
      .join("");

    if (summaryText) return summaryText;

    return (props.message.content ?? [])
      .filter((c) => c.type === "reasoning_text")
      .map((c) => (c as { type: "reasoning_text"; text: string }).text)
      .join("");
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
      borderColor={theme.accentAmber}
    >
      <text paddingLeft={3} fg={theme.accentAmber} attributes={dimItalic}>
        ⟳ {content()}
      </text>
    </box>
  );
}
