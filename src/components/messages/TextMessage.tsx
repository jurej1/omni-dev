import { createMemo, Show } from "solid-js";
import type { MessageMessage } from "../../messages";
import { theme, syntaxStyle } from "./shared";

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
        border={["left"]}
        paddingLeft={2}
        paddingTop={1}
        paddingBottom={1}
        marginTop={1}
        flexShrink={0}
        borderColor={theme.accentDimGray}
      >
        <box paddingLeft={3}>
          <code
            filetype="markdown"
            syntaxStyle={syntaxStyle}
            content={text()}
          />
        </box>
      </box>
    </Show>
  );
}
