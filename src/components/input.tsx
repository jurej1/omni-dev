import { createSignal, onCleanup, Show } from "solid-js";
import { useOpenRouter } from "../context/openrouter";
import { useSession } from "../context/session";
import { AgentTool } from "../utils/agent";
import { useAutocomplete } from "../context/autocomplete";
import { useCommands } from "../context/commands";
import type { CommandDefinition } from "../context/commands";
import {
  TextareaRenderable,
  createTextAttributes,
  KeyEvent,
} from "@opentui/core";
import { FileAutocomplete } from "./autocomplete";
import { CommandsAutocomplete } from "./commands";
import { Colors } from "../utils/colors";
import { ModelPicker } from "./model-picker";
import { EffortPicker } from "./effort-picker";
import { useModel } from "../context/model";
import { REASONING_EFFORT_LEVELS } from "../context/model";
import type { ReasoningEffort } from "../context/model";
import { Model } from "@openrouter/sdk/esm/models";

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
        <text fg={Colors.streamingColor} attributes={boldAttributes}>
          {SPINNER_FRAMES[frame()]}
        </text>
        <text fg={Colors.streamingColor} attributes={boldAttributes}>
          thinking
        </text>
        <text fg={Colors.streamingColor} attributes={dimAttributes}>
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
    mentionedFiles,
  } = useAutocomplete();

  const {
    commandsVisible,
    setCommandsVisible,
    commandsIndex,
    setCommandsIndex,
    setCommandsQuery,
    selectedCommandIndex,
    setSelectedCommandIndex,
    filteredCommands,
  } = useCommands();

  const {
    selectedModel,
    setSelectedModel,
    modelPickerVisible,
    setModelPickerVisible,
    selectedPickerIndex,
    setSelectedPickerIndex,
    filteredModels,
    reasoningEnabled,
    setReasoningEnabled,
    effortPickerVisible,
    setEffortPickerVisible,
    selectedEffortIndex,
    setSelectedEffortIndex,
    reasoningEffort,
    setReasoningEffort,
  } = useModel();

  const handleContentChange = () => {
    const text = input.plainText;

    if (commandsVisible()) {
      const cursor = input.cursorOffset;
      if (cursor <= commandsIndex()) {
        setCommandsVisible(false);
        return;
      }
      const between = text.slice(commandsIndex(), cursor);
      if (between.match(/\s/)) {
        setCommandsVisible(false);
        return;
      }
      setCommandsQuery(between.slice(1));
      return;
    }

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

    const lastSlashIndex = textBefore.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      const between = textBefore.slice(lastSlashIndex);
      const before =
        lastSlashIndex === 0 ? undefined : text[lastSlashIndex - 1];
      if ((before === undefined || /\s/.test(before)) && !between.match(/\s/)) {
        setCommandsIndex(lastSlashIndex);
        setCommandsQuery(between.slice(1));
        setSelectedCommandIndex(0);
        setCommandsVisible(true);
        return;
      }
    }

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

  const handleEffortSelect = (effort: ReasoningEffort) => {
    setReasoningEffort(effort);
    setEffortPickerVisible(false);
  };

  const handleKeyDown = (e: KeyEvent) => {
    const name = e.name?.toLowerCase();

    if (effortPickerVisible()) {
      const levels = [...REASONING_EFFORT_LEVELS];

      if (name === "up") {
        e.preventDefault();
        setSelectedEffortIndex((idx) =>
          idx === 0 ? levels.length - 1 : idx - 1,
        );
        return;
      }

      if (name === "down") {
        e.preventDefault();
        setSelectedEffortIndex((idx) =>
          idx === levels.length - 1 ? 0 : idx + 1,
        );
        return;
      }

      if (name === "escape") {
        e.preventDefault();
        setEffortPickerVisible(false);
        return;
      }

      if (name === "return") {
        e.preventDefault();
        const selected = [...REASONING_EFFORT_LEVELS][selectedEffortIndex()];
        if (selected) handleEffortSelect(selected);
        return;
      }

      return;
    }

    if (modelPickerVisible()) {
      const models = filteredModels();

      if (name === "up") {
        e.preventDefault();
        setSelectedPickerIndex((idx) =>
          idx === 0 ? models.length - 1 : idx - 1,
        );
        return;
      }

      if (name === "down") {
        e.preventDefault();
        setSelectedPickerIndex((idx) =>
          idx === models.length - 1 ? 0 : idx + 1,
        );
        return;
      }

      if (name === "escape") {
        e.preventDefault();
        setModelPickerVisible(false);
        return;
      }

      if (name === "return") {
        e.preventDefault();
        const selected = models[selectedPickerIndex()];
        if (selected) handleModelSelect(selected);
        return;
      }

      return;
    }

    if (e.ctrl && name === "r") {
      e.preventDefault();
      setReasoningEnabled((v) => !v);
      return;
    }

    if (name === "tab") {
      if (commandsVisible()) {
        e.preventDefault();
        const commands = filteredCommands();
        const selected = commands[selectedCommandIndex()];
        if (selected) handleCommandSelect(selected);
        return;
      }
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

    if (!commandsVisible() && !autocompleteVisible() && name === "/") {
      const cursor = input.cursorOffset;
      const charBefore =
        cursor === 0 ? undefined : input.getTextRange(cursor - 1, cursor);
      const canTrigger =
        charBefore === undefined || charBefore === "" || /\s/.test(charBefore);
      if (canTrigger) {
        setCommandsIndex(cursor);
        setCommandsQuery("");
        setSelectedCommandIndex(0);
        setCommandsVisible(true);
      }
      return;
    }

    if (!commandsVisible() && !autocompleteVisible() && name === "@") {
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

    if (commandsVisible()) {
      const commands = filteredCommands();

      if (name === "up") {
        e.preventDefault();
        setSelectedCommandIndex((idx) =>
          idx === 0 ? commands.length - 1 : idx - 1,
        );
        return;
      }

      if (name === "down") {
        e.preventDefault();
        setSelectedCommandIndex((idx) =>
          idx === commands.length - 1 ? 0 : idx + 1,
        );
        return;
      }

      if (name === "escape") {
        e.preventDefault();
        setCommandsVisible(false);
        return;
      }

      if (name === "return") {
        e.preventDefault();
        const selected = commands[selectedCommandIndex()];
        if (selected) handleCommandSelect(selected);
        return;
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

  const handleCommandSelect = (command: CommandDefinition) => {
    const currentCursor = input.cursorOffset;
    input.cursorOffset = commandsIndex();
    const startCursor = input.logicalCursor;
    input.cursorOffset = currentCursor;
    const endCursor = input.logicalCursor;

    input.deleteRange(
      startCursor.row,
      startCursor.col,
      endCursor.row,
      endCursor.col,
    );

    setCommandsVisible(false);
    command.action();
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setModelPickerVisible(false);
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
    callModel(rawText, mentionedFiles());
    input.clear();
    setMentionedFiles([]);
  };

  return (
    <box
      borderStyle="single"
      borderColor={isStreaming() ? Colors.streamingColor : Colors.borderColor}
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
                  <FileAutocomplete onSelect={handleSelect} />
                </Show>
                <Show when={commandsVisible()}>
                  <CommandsAutocomplete onSelect={handleCommandSelect} />
                </Show>
                <Show when={modelPickerVisible()}>
                  <ModelPicker onSelect={handleModelSelect} />
                </Show>
                <Show when={effortPickerVisible()}>
                  <EffortPicker onSelect={handleEffortSelect} />
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
              <text fg={agent().color} attributes={boldAttributes}>
                {agent().sigil} {agent().label}
              </text>
              <text fg={Colors.blueGray} attributes={dimAttributes}>
                │
              </text>
              <text fg={Colors.blueGray} attributes={dimAttributes}>
                model: {selectedModel()?.id}
              </text>
              <text fg={Colors.blueGray} attributes={dimAttributes}>
                │
              </text>

              <Show when={reasoningEnabled()}>
                <text fg={Colors.streamingColor} attributes={boldAttributes}>
                  🧠
                </text>
              </Show>
              <Show when={reasoningEnabled()}>
                <text fg={Colors.blueGray} attributes={dimAttributes}>
                  │
                </text>
                <text fg={Colors.blueGray} attributes={dimAttributes}>
                  effort: {reasoningEffort()}
                </text>
              </Show>
            </box>
          </>
        }
      >
        <ThinkingIndicator agent={agent()} />
      </Show>
    </box>
  );
}
