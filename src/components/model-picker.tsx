import { Index, Show, createEffect } from "solid-js";
import type { ScrollBoxRenderable } from "@opentui/core";
import { useModel } from "../context/model";
import { Colors } from "../utils/colors";
import { Model } from "@openrouter/sdk/esm/models";

export type ModelPickerProps = {
  onSelect: (model: Model) => void;
};

function formatPricing(promptPrice: string | undefined): string {
  if (!promptPrice) return "     ";
  const perToken = parseFloat(promptPrice);
  if (isNaN(perToken) || perToken === 0) return " free";
  const perMillion = perToken * 1_000_000;
  if (perMillion < 0.01) return " free";
  return `$${perMillion.toFixed(2)}/M`;
}

function splitModelId(id: string): { provider: string; name: string } {
  const slash = id.indexOf("/");
  if (slash === -1) return { provider: "", name: id };
  return { provider: id.slice(0, slash), name: id.slice(slash + 1) };
}

export function ModelPicker(props: ModelPickerProps) {
  const {
    modelPickerVisible,
    filteredModels,
    selectedPickerIndex,
    scrollOffset,
    modelsLoading,
  } = useModel();

  let scrollboxRef: ScrollBoxRenderable | undefined;

  createEffect(() => {
    const offset = scrollOffset();
    scrollboxRef?.scrollTo(offset);
  });

  return (
    <box
      visible={modelPickerVisible()}
      position="absolute"
      bottom={2}
      left={0}
      right={0}
      height={15}
      zIndex={100}
      backgroundColor={Colors.primary}
      borderStyle="single"
      borderColor={Colors.borderColor}
    >
      <Show
        when={filteredModels().length > 0}
        fallback={
          <text color={Colors.blueGray}>
            {modelsLoading() ? " Loading models..." : " No models"}
          </text>
        }
      >
        <scrollbox ref={scrollboxRef} height={13} scrollbarOptions={{ visible: false }}>
          <Index each={filteredModels()}>
            {(model, idx) => {
              const isSelected = () => idx === selectedPickerIndex();
              const { provider, name } = splitModelId(model().id);
              const pricing = formatPricing(model().pricing?.prompt);
              const isFree = pricing.trim() === "free";

              return (
                <box
                  paddingLeft={1}
                  paddingRight={1}
                  backgroundColor={isSelected() ? "#1e3a5f" : undefined}
                  onMouseDown={() => {
                    props.onSelect(model());
                  }}
                  onMouseUp={() => {}}
                  justifyContent="space-between"
                  flexDirection="row"
                >
                  <box flexDirection="row" gap={1}>
                    <text color={isSelected() ? Colors.streamingColor : Colors.blueGray}>
                      {provider ? `${provider}/` : ""}
                    </text>
                    <text color={isSelected() ? "#f0f6fc" : "#c9d1d9"}>
                      {name}
                    </text>
                  </box>
                  <text
                    color={
                      isFree
                        ? "#4ade80"
                        : isSelected()
                          ? Colors.streamingColor
                          : Colors.blueGray
                    }
                  >
                    {pricing}
                  </text>
                </box>
              );
            }}
          </Index>
        </scrollbox>
      </Show>
    </box>
  );
}
