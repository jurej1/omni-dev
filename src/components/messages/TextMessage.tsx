import { createMemo, Show } from "solid-js";
import type { MessageMessage } from "../../messages";
import { syntaxStyle, theme } from "./shared";

export function TextMessage(props: { message: MessageMessage }) {
  const text = createMemo(() =>
    props.message.content
      .filter((c) => c.type === "output_text")
      .map((c) => (c as { type: "output_text"; text: string }).text)
      .join(""),
  );

  return (
    <Show when={text().trim()}>
      <box
        id={"text-" + props.message.id}
        paddingLeft={3}
        marginTop={1}
        flexShrink={0}
      >
        <code
          drawUnstyledText={false}
          filetype="markdown"
          syntaxStyle={syntaxStyle}
          content={text()}
          fg={theme.text}
          streaming={true}
        />
      </box>
    </Show>
  );
}
