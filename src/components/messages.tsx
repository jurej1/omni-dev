import { For, Match, Switch } from "solid-js";
import { useMessages } from "../context/messages";
import type {
  FunctionCallMessage,
  FunctionCallOutputMessage,
  MessageMessage,
  ReasoningMessage,
} from "../messages";

function TextMessage(props: { message: MessageMessage }) {
  const prefix = props.message.role === "user" ? "[user]" : "[assistant]";
  const text = () =>
    props.message.content
      .filter((c) => c.type === "output_text")
      .map((c) => (c as { type: "output_text"; text: string }).text)
      .join("");

  return <text>{`${prefix} ${text()}`}</text>;
}

function FunctionCallItem(props: { message: FunctionCallMessage }) {
  const status = () =>
    props.message.status ? ` (${props.message.status})` : "";
  return (
    <text>{`[tool] ${props.message.name}(${props.message.arguments})${status()}`}</text>
  );
}

function FunctionCallOutputItem(props: { message: FunctionCallOutputMessage }) {
  return <text>{`[output] ${props.message.output}`}</text>;
}

function ReasoningItem(props: { message: ReasoningMessage }) {
  const text = () => {
    if (props.message.status === "completed") {
      return props.message.content
        .filter((c) => c.type === "reasoning_text")
        .map((c) => (c as { type: "reasoning_text"; text: string }).text)
        .join("");
    }
    return props.message.summary
      .filter((s) => s.type === "summary_text")
      .map((s) => (s as { type: "summary_text"; text: string }).text)
      .join("");
  };

  return <text>{`[thinking] ${text()}`}</text>;
}

export function Messages() {
  const { messages } = useMessages();

  return (
    <scrollbox>
      <For each={messages()}>
        {(message) => (
          <Switch>
            <Match when={message.type === "message"}>
              <TextMessage message={message as MessageMessage} />
            </Match>
            <Match when={message.type === "function_call"}>
              <FunctionCallItem message={message as FunctionCallMessage} />
            </Match>
            <Match when={message.type === "function_call_output"}>
              <FunctionCallOutputItem
                message={message as FunctionCallOutputMessage}
              />
            </Match>
            <Match when={message.type === "reasoning"}>
              <ReasoningItem message={message as ReasoningMessage} />
            </Match>
          </Switch>
        )}
      </For>
    </scrollbox>
  );
}
