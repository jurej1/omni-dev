import { createMemo, Index } from "solid-js";

export type FileAutocompleteProps = {
  visible: boolean;
  options: string[];
  selectedIndex: number;
  onSelect: (path: string) => void;
  onDismiss: () => void;
};

export function FileAutocomplete(props: FileAutocompleteProps) {
  const displayItems = createMemo(() => {
    return props.options.slice(0, 10);
  });

  const boxHeight = createMemo(() => {
    return Math.min(10, displayItems().length);
  });

  return (
    <box
      visible={props.visible}
      position="absolute"
      bottom={2}
      left={0}
      right={0}
      height={boxHeight()}
      zIndex={100}
      borderStyle="single"
      borderColor="#30363d"
    >
      <scrollbox height={"auto"} scrollbarOptions={{ visible: false }}>
        <Index each={displayItems()}>
          {(option, idx) => (
            <box
              paddingLeft={1}
              paddingRight={1}
              backgroundColor={
                idx === props.selectedIndex ? "#1d4ed8" : undefined
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
    </box>
  );
}
