import { Index, Show } from "solid-js";
import { useModel } from "../context/model";
import { REASONING_EFFORT_LEVELS } from "../context/model";
import type { ReasoningEffort } from "../context/model";
import { Colors } from "../utils/colors";

export type EffortPickerProps = {
  onSelect: (effort: ReasoningEffort) => void;
};

export function EffortPicker(props: EffortPickerProps) {
  const { effortPickerVisible, selectedEffortIndex } = useModel();

  return (
    <box
      visible={effortPickerVisible()}
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
        when={REASONING_EFFORT_LEVELS.length > 0}
        fallback={<text>No effort levels</text>}
      >
        <scrollbox height={"auto"} scrollbarOptions={{ visible: false }}>
          <Index each={[...REASONING_EFFORT_LEVELS]}>
            {(level, idx) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={
                  idx === selectedEffortIndex() ? "#1d4ed8" : undefined
                }
                onMouseDown={() => {
                  props.onSelect(level());
                }}
                onMouseUp={() => {}}
              >
                <text>{level()}</text>
              </box>
            )}
          </Index>
        </scrollbox>
      </Show>
    </box>
  );
}
