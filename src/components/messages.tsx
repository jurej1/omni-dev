import { For, Match, Switch, createMemo, Show, JSX } from "solid-js";
import { useMessages } from "../context/messages";
import { SyntaxStyle, RGBA } from "@opentui/core";

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
  const prefix = props.message.role === "user" ? "[user]" : "[assistant]";

  return (
    <text paddingLeft={3} fg={theme.textMuted}>
      {prefix}
      {props.message.content}
    </text>
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
    const text =
      props.message.status === "completed"
        ? props.message.content
            .filter((c) => c.type === "reasoning_text")
            .map((c) => (c as { type: "reasoning_text"; text: string }).text)
            .join("")
        : props.message.summary
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

  return (
    <scrollbox flexGrow={1}>
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
