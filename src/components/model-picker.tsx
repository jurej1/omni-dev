import { Index, Show } from "solid-js";
import { useModel } from "../context/model";
import type { ModelId } from "../context/model";
import { Colors } from "../utils/colors";

export type ModelPickerProps = {
  onSelect: (model: ModelId) => void;
};

export function ModelPicker(props: ModelPickerProps) {
  const { modelPickerVisible, filteredModels, selectedPickerIndex } =
    useModel();

  return (
    <box
      visible={modelPickerVisible()}
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
        when={filteredModels().length > 0}
        fallback={<text>No models</text>}
      >
        <scrollbox height={"auto"} scrollbarOptions={{ visible: false }}>
          <Index each={filteredModels()}>
            {(model, idx) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                backgroundColor={
                  idx === selectedPickerIndex() ? "#1d4ed8" : undefined
                }
                onMouseDown={() => {
                  props.onSelect(model());
                }}
                onMouseUp={() => {}}
              >
                <text>{model()}</text>
              </box>
            )}
          </Index>
        </scrollbox>
      </Show>
    </box>
  );
}
