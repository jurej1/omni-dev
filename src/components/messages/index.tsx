import { For, createMemo, Show } from "solid-js";
import { useMessages } from "../../context/messages";

import { Dynamic } from "@opentui/solid";
import { TextMessage } from "./TextMessage";
import { UserMessage } from "./UserMessage";
import { ReasoningItem } from "./ReasoningItem";
import { FunctionCallItem } from "./FunctionCallItem";
import { FunctionCallOutputItem } from "./FunctionCallOutputItem";

export function Messages() {
  const { messages } = useMessages();

  return (
    <scrollbox flexGrow={1} stickyScroll={true} stickyStart="bottom">
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
