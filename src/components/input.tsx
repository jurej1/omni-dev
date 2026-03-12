import { createSignal } from "solid-js";
import { useOpenRouter } from "../context/openrouter";

export function Input() {
  const [value, setValue] = createSignal("");

  const { callModel } = useOpenRouter();

  return (
    <box borderStyle="single">
      <input
        focused={true}
        value={value()}
        onInput={setValue}
        onSubmit={callModel}
      ></input>
    </box>
  );
}
