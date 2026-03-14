import {
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import { useOpenRouter } from "../context/openrouter";
import { useSession } from "../context/session";
import { useAutocomplete } from "../context/autocomplete";
import { useKeyboard } from "@opentui/solid";
import {
  TextareaRenderable,
  createTextAttributes,
  KeyEvent,
} from "@opentui/core";
import { FileAutocomplete } from "./autocomplete";

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
    <box flexDirection="row" gap={1} padding={0} alignItems="center">
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
  const { currentAgentName, switchToAgent } = useSession();
  const {
    autocompleteVisible,
    setAutocompleteVisible,
    autocompleteIndex,
    setAutocompleteIndex,
    autocompleteQuery,
    setAutocompleteQuery,
    selectedIndex,
    setSelectedIndex,
    mentionedFiles,
    setMentionedFiles,
    filteredOptions,
  } = useAutocomplete();

  const handleContentChange = () => {
    const text = input.plainText;
    if (autocompleteVisible()) {
      const cursor = input.cursorOffset;
      if (cursor <= autocompleteIndex()) {
        setAutocompleteVisible(false);
        return;
      }
      const between = text.slice(autocompleteIndex(), cursor);
      if (between.match(/\s/)) {
        setAutocompleteVisible(false);
        return;
      }
      setAutocompleteQuery(between.slice(1));
      return;
    }

    const cursor = input.cursorOffset;
    if (cursor === 0) return;

    const textBefore = text.slice(0, cursor);
    const lastAtIndex = textBefore.lastIndexOf("@");
    if (lastAtIndex === -1) return;

    const between = textBefore.slice(lastAtIndex);
    const before = lastAtIndex === 0 ? undefined : text[lastAtIndex - 1];

    if ((before === undefined || /\s/.test(before)) && !between.match(/\s/)) {
      setAutocompleteIndex(lastAtIndex);
      setAutocompleteQuery(between.slice(1));
      setSelectedIndex(0);
      setAutocompleteVisible(true);
    }
  };

  const handleKeyDown = (e: KeyEvent) => {
    const name = e.name?.toLowerCase();

    // Handle Tab to switch between agents
    if (name === "tab") {
      // Only switch agents if autocomplete is not visible
      if (!autocompleteVisible()) {
        e.preventDefault();
        const agents = ["plan", "build"];
        const current = currentAgentName().toLowerCase();
        const nextAgent = current === "plan" ? "build" : "plan";
        switchToAgent(nextAgent);
        return;
      }
      // If autocomplete is visible, handle Tab normally for selection
      e.preventDefault();
      const options = filteredOptions && filteredOptions();
      const selected = options[selectedIndex()];
      if (selected) {
        handleSelect(selected);
      }
      return;
    }

    // Check for "@" key to trigger autocomplete
    if (!autocompleteVisible() && name === "@") {
      const cursor = input.cursorOffset;
      const charBefore =
        cursor === 0 ? undefined : input.getTextRange(cursor - 1, cursor);
      const canTrigger =
        charBefore === undefined || charBefore === "" || /\s/.test(charBefore);
      if (canTrigger) {
        setAutocompleteIndex(cursor);
        setAutocompleteQuery("");
        setSelectedIndex(0);
        setAutocompleteVisible(true);
      }
      return;
    }

    if (!autocompleteVisible()) return;

    const options = filteredOptions && filteredOptions();

    if (name === "up") {
      e.preventDefault();
      setSelectedIndex((idx) => (idx === 0 ? options.length - 1 : idx - 1));
      return;
    }

    if (name === "down") {
      e.preventDefault();
      setSelectedIndex((idx) => (idx === options.length - 1 ? 0 : idx + 1));
      return;
    }

    if (name === "escape") {
      e.preventDefault();
      setAutocompleteVisible(false);
      return;
    }

    if (name === "return") {
      e.preventDefault();
      const selected = options[selectedIndex()];
      if (selected) {
        handleSelect(selected);
      }
      return;
    }
  };

  const handleSelect = async (path: string) => {
    const currentCursor = input.cursorOffset;
    input.cursorOffset = autocompleteIndex();
    const startCursor = input.logicalCursor;
    input.cursorOffset = currentCursor;
    const endCursor = input.logicalCursor;

    input.deleteRange(
      startCursor.row,
      startCursor.col,
      endCursor.row,
      endCursor.col,
    );
    input.insertText("@" + path + " ");

    setMentionedFiles((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setAutocompleteVisible(false);
  };

  const submit = async () => {
    if (isStreaming()) return;
    const rawText = input.plainText;

    callModel(rawText);
    input.clear();
    setMentionedFiles([]);
  };

  const getAgentColor = () => {
    const agent = currentAgentName();
    return agent === "plan" ? "#a78bfa" : "#34d399";
  };

  const getAgentIcon = () => {
    const agent = currentAgentName();
    return agent === "plan" ? "📋" : "🔨";
  };

  return (
    <box
      borderStyle="single"
      borderColor={isStreaming() ? "#38bdf8" : "#30363d"}
      margin={0}
      padding={0}
      position="relative"
    >
      <Show
        when={isStreaming()}
        fallback={
          <>
            <box flexDirection="row" gap={1} padding={0} alignItems="flex-start">
              <box width="auto" padding={0} paddingLeft={1} paddingTop={0}>
                <text fg={getAgentColor()} attributes={boldAttributes}>
                  {getAgentIcon()} {currentAgentName().toUpperCase()}
                </text>
              </box>
              <box flexGrow={1}>
                <textarea
                  focused={true}
                  placeholder={PLACEHOLDERS[0]}
                  minHeight={1}
                  maxHeight={6}
                  onSubmit={submit}
                  onMouseDown={(e) => e.target.focus()}
                  onContentChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  ref={input}
                ></textarea>
                <Show when={autocompleteVisible()}>
                  <FileAutocomplete
                    visible={autocompleteVisible()}
                    options={filteredOptions()}
                    selectedIndex={selectedIndex()}
                    onSelect={handleSelect}
                    onDismiss={() => setAutocompleteVisible(false)}
                  />
                </Show>
              </box>
            </box>
          </>
        }
      >
        <ThinkingIndicator />
      </Show>
    </box>
  );
}
