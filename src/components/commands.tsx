import { Index, Show } from "solid-js";
import { useCommands } from "../context/commands";
import type { CommandDefinition } from "../context/commands";
import { Colors } from "../utils/colors";

export type CommandsAutocompleteProps = {
  onSelect: (command: CommandDefinition) => void;
};

export function CommandsAutocomplete(props: CommandsAutocompleteProps) {
  const { commandsVisible, filteredCommands, selectedCommandIndex } =
    useCommands();

  return (
    <box
      visible={commandsVisible()}
      position="absolute"
      bottom={2}
      left={0}
      right={0}
      height={"auto"}
      zIndex={100}
      backgroundColor={Colors.primary}
      borderStyle="single"
      borderColor={Colors.borderColor}
    >
      <Show
        when={filteredCommands().length > 0}
        fallback={<text>No results</text>}
      >
        <scrollbox height={"auto"} scrollbarOptions={{ visible: false }}>
          <Index each={filteredCommands()}>
            {(command, idx) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={
                  idx === selectedCommandIndex() ? "#1d4ed8" : undefined
                }
                onMouseDown={() => {
                  props.onSelect(command());
                }}
                onMouseUp={() => {}}
              >
                <text>/{command().name}</text>
                <text> — {command().description}</text>
              </box>
            )}
          </Index>
        </scrollbox>
      </Show>
    </box>
  );
}
