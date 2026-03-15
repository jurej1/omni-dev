import { createMemo, Index, Show } from "solid-js";
import { useAutocomplete } from "../context/autocomplete";
import { Colors } from "../utils/colors";

export type FileAutocompleteProps = {
  onSelect: (path: string) => void;
};

export function FileAutocomplete(props: FileAutocompleteProps) {
  const { autocompleteVisible, filteredOptions, selectedIndex } =
    useAutocomplete();

  const displayItems = createMemo(() => {
    return filteredOptions().slice(0, 10);
  });

  return (
    <box
      visible={autocompleteVisible()}
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
      <Show when={displayItems().length > 0} fallback={<text>No results</text>}>
        <scrollbox height={"auto"} scrollbarOptions={{ visible: false }}>
          <Index each={displayItems()}>
            {(option, idx) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={
                  idx === selectedIndex() ? "#1d4ed8" : undefined
                }
                onMouseDown={() => {
                  props.onSelect(option());
                }}
                onMouseUp={() => {}}
              >
                <text>{option()}</text>
              </box>
            )}
          </Index>
        </scrollbox>
      </Show>
    </box>
  );
}
