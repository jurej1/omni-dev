import { Show } from "solid-js";
import type { UserMessage as UserMessageType } from "../../messages";
import { syntaxStyle, theme, bold } from "./shared";

export function UserMessage(props: { message: UserMessageType }) {
  return (
    <box
      id={"user-" + (props.message as any).id}
      border={["right"]}
      paddingX={2}
      paddingY={1}
      marginTop={1}
      flexShrink={0}
      backgroundColor={theme.backgroundPanel}
      borderColor="#58A6FF"
      gap={1}
    >
      <text fg="#79C0FF" attributes={bold}>
        👤 You:
      </text>
      <Show when={props.message.content.trim()}>
        <code
          drawUnstyledText={false}
          filetype="markdown"
          syntaxStyle={syntaxStyle}
          content={props.message.content}
          fg={theme.text}
        />
      </Show>
    </box>
  );
}
