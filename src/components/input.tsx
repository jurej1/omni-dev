import { useOpenRouter } from "../context/openrouter";
import { TextareaRenderable } from "@opentui/core";

const PLACEHOLDERS = [
  "Fix a TODO in the codebase",
  "What is the tech stack of this project?",
  "Fix broken tests",
];

export function Input() {
  let input: TextareaRenderable;

  const { callModel } = useOpenRouter();

  const submit = async () => {
    const value = input.plainText;

    callModel(value);
    input.clear();
  };

  return (
    <box borderStyle="single" margin={0} padding={0}>
      <textarea
        focused={true}
        placeholder={PLACEHOLDERS[0]}
        minHeight={1}
        onSubmit={submit}
        onMouseDown={(e) => e.target.focus()}
        ref={input}
      ></textarea>
    </box>
  );
}
