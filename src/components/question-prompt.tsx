import { createSignal, For, Show } from "solid-js";
import { useQuestion } from "../context/question";
import { TextareaRenderable, KeyEvent } from "@opentui/core";
import { Colors } from "../utils/colors";

export function QuestionPrompt() {
  const { questions, reply } = useQuestion();
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [collectedAnswers, setCollectedAnswers] = createSignal<string[]>([]);

  let textarea: TextareaRenderable;

  function handleKeyDown(e: KeyEvent) {
    if (e.name?.toLowerCase() !== "return") return;
    e.preventDefault();

    const answer = textarea.plainText.trim();
    const qs = questions();
    const idx = currentIndex();
    const updated = [...collectedAnswers(), answer];

    if (idx < qs.length - 1) {
      setCollectedAnswers(updated);
      setCurrentIndex(idx + 1);
      textarea.clear();
    } else {
      reply(updated);
      setCollectedAnswers([]);
      setCurrentIndex(0);
      textarea.clear();
    }
  }

  return (
    <Show when={questions().length > 0}>
      <box
        flexDirection="column"
        borderStyle="single"
        borderColor={Colors.streamingColor}
        paddingLeft={1}
        paddingRight={1}
        gap={1}
      >
        <For each={questions()}>
          {(question, i) => (
            <Show when={i() < currentIndex()}>
              <box flexDirection="row" gap={1}>
                <text fg={Colors.blueGray}>{question}</text>
                <text fg={Colors.streamingColor}>{collectedAnswers()[i()]}</text>
              </box>
            </Show>
          )}
        </For>

        <box flexDirection="column" gap={1}>
          <text fg={Colors.streamingColor}>
            [{currentIndex() + 1}/{questions().length}] {questions()[currentIndex()]}
          </text>
          <textarea
            focused={true}
            minHeight={1}
            maxHeight={4}
            onKeyDown={handleKeyDown}
            ref={textarea}
          />
        </box>
      </box>
    </Show>
  );
}
