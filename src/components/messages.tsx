import { For, createMemo, Show } from "solid-js";
import { useMessages } from "../context/messages";
import {
  SyntaxStyle,
  RGBA,
  createTextAttributes,
  ScrollBoxRenderable,
} from "@opentui/core";

const bold = createTextAttributes({ bold: true });

import type {
  FunctionCallMessage,
  FunctionCallOutputMessage,
  MessageMessage,
  ReasoningMessage,
  UserMessage,
} from "../messages";
import { Dynamic } from "@opentui/solid";

// Simplified syntax style for nice formatting
const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.3": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
});

// Theme colors for nice formatting
const theme = {
  text: "#E6EDF3",
  textMuted: "#8B949E",
  background: "#010409",
  backgroundPanel: "#0D1117",
  backgroundMenu: "#161B22",
  error: "#FF7B72",
  warning: "#D29922",
};

// Text message component with nice formatting
function TextMessage(props: { message: MessageMessage }) {
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

function UserMessage(props: { message: UserMessage }) {
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

// Function call item with nice formatting
function FunctionCallItem(props: { message: FunctionCallMessage }) {
  const status = createMemo(() =>
    props.message.status ? ` (${props.message.status})` : "",
  );

  const content = createMemo(
    () => `[tool] ${props.message.name}(${props.message.arguments})${status()}`,
  );

  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundPanel}
      borderColor={theme.background}
    >
      <text paddingLeft={3} fg={theme.textMuted}>
        ⚙ {content()}
      </text>
    </box>
  );
}

// Function call output item with nice formatting
function FunctionCallOutputItem(props: { message: FunctionCallOutputMessage }) {
  const content = createMemo(() => `[output] ${props.message.output}`);

  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundPanel}
      borderColor={theme.background}
    >
      <text paddingLeft={3} fg={theme.textMuted}>
        ⚙ {content()}
      </text>
    </box>
  );
}

// Reasoning item with nice formatting
function ReasoningItem(props: { message: ReasoningMessage }) {
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

export function Messages() {
  const { messages } = useMessages();

  let scroll: ScrollBoxRenderable;

  return (
    <scrollbox
      flexGrow={1}
      ref={(r) => (scroll = r)}
      stickyScroll={true}
      stickyStart="bottom"
    >
      <For each={messages()}>
        {(message) => {
          const component = createMemo(() => {
            switch (message.type) {
              case "message": {
                if (message.role === "user") {
                  return UserMessage;
                } else {
                  return TextMessage;
                }
              }
              case "function_call":
                return FunctionCallItem;
              case "function_call_output":
                return FunctionCallOutputItem;
              case "reasoning":
                return ReasoningItem;
              default:
                return null;
            }
          });
          return (
            <Show when={component()}>
              <Dynamic component={component()} message={message as any} />
            </Show>
          );
        }}
      </For>
    </scrollbox>
  );
}
