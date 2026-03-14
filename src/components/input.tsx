import { createSignal, onCleanup, Show } from "solid-js";
import { useOpenRouter } from "../context/openrouter";
import { useSession } from "../context/session";
import { AgentTool } from "../utils/agent";
import { useAutocomplete } from "../context/autocomplete";
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


function ThinkingIndicator({ agent }: { agent: AgentTool.Definition | null }) {
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
    <box flexDirection="column" padding={0}>
      {/* Status row */}
      <box
        flexDirection="row"
        gap={1}
        paddingLeft={1}
        paddingRight={1}
        paddingTop={0}
        paddingBottom={0}
        alignItems="center"
      >
        <text fg={agent?.color} attributes={boldAttributes}>
          {agent?.sigil} {agent?.label}
        </text>
        <text fg="#475569" attributes={dimAttributes}>
          │
        </text>
        <text fg="#38bdf8" attributes={boldAttributes}>
          {SPINNER_FRAMES[frame()]}
        </text>
        <text fg="#38bdf8" attributes={boldAttributes}>
          thinking
        </text>
        <text fg="#64748b" attributes={dimAttributes}>
          {THINKING_DOTS[dots()]}
        </text>
      </box>
    </box>
  );
}

export function Input() {
  let input: TextareaRenderable;

  const { callModel, isStreaming } = useOpenRouter();
  const { agent, currentAgentName, switchToAgent } = useSession();

  const {
    autocompleteVisible,
    setAutocompleteVisible,
    autocompleteIndex,
    setAutocompleteIndex,
    setAutocompleteQuery,
    selectedIndex,
    setSelectedIndex,
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

    if (name === "tab") {
      if (!autocompleteVisible()) {
        e.preventDefault();
        const current = currentAgentName().toLowerCase();
        switchToAgent(current === "plan" ? "build" : "plan");
        return;
      }
      e.preventDefault();
      const options = filteredOptions && filteredOptions();
      const selected = options[selectedIndex()];
      if (selected) handleSelect(selected);
      return;
    }

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
      if (selected) handleSelect(selected);
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

  return (
    <box
      borderStyle="single"
      borderColor={isStreaming() ? "#38bdf8" : "#1e293b"}
      margin={0}
      padding={0}
      flexDirection="column"
      gap={1}
    >
      <Show
        when={isStreaming()}
        fallback={
          <>
            <box flexDirection="row" paddingLeft={1} paddingRight={1}>
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
                />
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

            <box
              flexDirection="row"
              gap={1}
              paddingLeft={1}
              paddingRight={1}
              paddingTop={0}
              paddingBottom={0}
              alignItems="center"
            >
              <text
                fg={agent().color}
                attributes={boldAttributes}
              >
                {agent().sigil}{" "}
                {agent().label}
              </text>
              <text fg="#334155" attributes={dimAttributes}>
                │
              </text>
              <text fg="#334155" attributes={dimAttributes}>
                tab to switch · @ for files · enter to send
              </text>
            </box>
          </>
        }
      >
        <ThinkingIndicator agent={agent()} />
      </Show>
    </box>
  );
}
