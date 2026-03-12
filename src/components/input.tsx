import { createSignal } from "solid-js";
import { OpenRouterProvider } from "../openrouter/openrouter";

export function Input() {
  const [value, setValue] = createSignal("");
  const [response, setResponse] = createSignal("");

  const handleSubmit = async () => {
    const result = await OpenRouterProvider.callModel({
      data: value(),
      callback: (msg) => {},
    });
    setResponse(result);
  };

  return (
    <box flexDirection="column">
      <box borderStyle="single">
        <input
          focused={true}
          value={value()}
          onInput={setValue}
          onSubmit={handleSubmit}
        ></input>
      </box>
      <box>
        <text>{response()}</text>
      </box>
    </box>
  );
}
