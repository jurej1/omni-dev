import { createSignal, For, onCleanup, Show } from "solid-js";
import { subscribeQuestionsAsk, publishQuestionsAnswers } from "../events";
import { createTextAttributes, KeyEvent, TextareaRenderable } from "@opentui/core";
import { Colors } from "../utils/colors";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

export function QuestionPrompt() {
  const [questions, setQuestions] = createSignal<string[]>([]);
  const [answers, setAnswers] = createSignal<string[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  let input: TextareaRenderable;

  const unsub = subscribeQuestionsAsk((qs) => {
    setQuestions(qs);
    setAnswers([]);
    setCurrentIndex(0);
  });

  onCleanup(unsub);

  const isActive = () => questions().length > 0;
  const current = () => questions()[currentIndex()];

  const submit = () => {
    const text = input?.plainText?.trim() ?? "";
    const next = [...answers(), text];

    if (currentIndex() < questions().length - 1) {
      setAnswers(next);
      setCurrentIndex((i) => i + 1);
      input?.clear();
    } else {
      publishQuestionsAnswers(next);
      setQuestions([]);
      setAnswers([]);
      setCurrentIndex(0);
      input?.clear();
    }
  };

  const handleKeyDown = (e: KeyEvent) => {
    if (e.name?.toLowerCase() === "escape") {
      e.preventDefault();
      publishQuestionsAnswers([...answers(), ""]);
      setQuestions([]);
      setAnswers([]);
      setCurrentIndex(0);
      input?.clear();
    }
  };

  return (
    <Show when={isActive()}>
      <box
        borderStyle="single"
        borderColor={Colors.streamingColor}
        flexDirection="column"
        gap={1}
        padding={1}
      >
        <box flexDirection="row" gap={1} alignItems="center">
          <text fg={Colors.streamingColor} attributes={bold}>
            ?
          </text>
          <text fg="#E6EDF3" attributes={bold}>
            {currentIndex() + 1}/{questions().length}
          </text>
          <text fg="#6e7681" attributes={dim}>
            (esc to skip remaining)
          </text>
        </box>

        <text fg="#E6EDF3">{current()}</text>

        <Show when={answers().length > 0}>
          <box flexDirection="column" gap={0}>
            <For each={answers()}>
              {(ans, i) => (
                <box flexDirection="row" gap={1}>
                  <text fg="#6e7681" attributes={dim}>
                    {i() + 1}.
                  </text>
                  <text fg="#4ade80">{ans}</text>
                </box>
              )}
            </For>
          </box>
        </Show>

        <textarea
          focused={true}
          placeholder="Type your answer…"
          minHeight={1}
          maxHeight={4}
          onSubmit={submit}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.target.focus()}
          ref={input}
        />
      </box>
    </Show>
  );
}
