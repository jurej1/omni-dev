import { createSignal, onCleanup, Show } from "solid-js";
import { useOpenRouter } from "../context/openrouter";
import { TextareaRenderable, createTextAttributes } from "@opentui/core";

const PLACEHOLDERS = [
  "Fix a TODO in the codebase",
  "What is the tech stack of this project?",
  "Fix broken tests",
];

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const THINKING_DOTS = ["   ", ".  ", ".. ", "..."];

const boldAttributes = createTextAttributes({ bold: true });
const dimAttributes = createTextAttributes({ dim: true });

function ThinkingIndicator() {
  const [frame, setFrame] = createSignal(0);
  const [dots, setDots] = createSignal(0);

  const spinnerInterval = setInterval(() => {
    setFrame((f) => (f + 1) % SPINNER_FRAMES.length);
  }, 80);

  const dotsInterval = setInterval(() => {
    setDots((d) => (d + 1) % THINKING_DOTS.length);
  }, 400);

  onCleanup(() => {
    clearInterval(spinnerInterval);
    clearInterval(dotsInterval);
  });

  return (
    <box flexDirection="row" gap={1} padding={0}>
      <text fg="#38bdf8" attributes={boldAttributes}>
        {SPINNER_FRAMES[frame()]}
      </text>
      <text fg="#38bdf8" attributes={boldAttributes}>
        Thinking
      </text>
      <text fg="#38bdf8" attributes={dimAttributes}>
        {THINKING_DOTS[dots()]}
      </text>
    </box>
  );
}

export function Input() {
  let input: TextareaRenderable;

  const { callModel, isStreaming } = useOpenRouter();

  const submit = async () => {
    if (isStreaming()) return;
    const value = input.plainText;

    callModel(value);
    input.clear();
  };

  return (
    <box
      borderStyle="single"
      borderColor={isStreaming() ? "#38bdf8" : "#30363d"}
      margin={0}
      padding={0}
    >
      <Show
        when={isStreaming()}
        fallback={
          <textarea
            focused={true}
            placeholder={PLACEHOLDERS[0]}
            minHeight={1}
            onSubmit={submit}
            onMouseDown={(e) => e.target.focus()}
            ref={input}
          ></textarea>
        }
      >
        <ThinkingIndicator />
      </Show>
    </box>
  );
}
