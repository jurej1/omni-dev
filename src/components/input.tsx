import { createSignal } from "solid-js";
import { OpenRouterProvider } from "../openrouter/openrouter";
import { useMessages } from "../context/messages";

export function Input() {
  const [value, setValue] = createSignal("");

  const { addMessage } = useMessages();

  const handleSubmit = async () => {
    await OpenRouterProvider.callModel({
      data: value(),
      callback: addMessage,
    });
  };

  return (
    <box borderStyle="single">
      <input
        focused={true}
        value={value()}
        onInput={setValue}
        onSubmit={handleSubmit}
      ></input>
    </box>
  );
}
