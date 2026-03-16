import {
  createContext,
  createSignal,
  useContext,
  createMemo,
} from "solid-js";
import type { ParentComponent } from "solid-js";

export const AVAILABLE_MODELS = [
  "x-ai/grok-4.1-fast",
  "x-ai/grok-4-fast",
  "arcee-ai/trinity-large-preview:free",
] as const;

export type ModelId = (typeof AVAILABLE_MODELS)[number];

type ModelContextValue = {
  selectedModel: () => ModelId;
  setSelectedModel: (model: ModelId) => void;
  modelPickerVisible: () => boolean;
  setModelPickerVisible: (v: boolean) => void;
  selectedPickerIndex: () => number;
  setSelectedPickerIndex: (v: number | ((prev: number) => number)) => void;
  filteredModels: () => ModelId[];
  reasoningEnabled: () => boolean;
  setReasoningEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
};

const ModelContext = createContext<ModelContextValue>();

export const ModelProvider: ParentComponent = (props) => {
  const [selectedModel, setSelectedModel] = createSignal<ModelId>(
    AVAILABLE_MODELS[0],
  );
  const [modelPickerVisible, setModelPickerVisible] = createSignal(false);
  const [selectedPickerIndex, setSelectedPickerIndex] = createSignal(0);
  const [reasoningEnabled, setReasoningEnabled] = createSignal(true);

  const filteredModels = createMemo((): ModelId[] =>
    modelPickerVisible() ? [...AVAILABLE_MODELS] : [],
  );

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        modelPickerVisible,
        setModelPickerVisible,
        selectedPickerIndex,
        setSelectedPickerIndex,
        filteredModels,
        reasoningEnabled,
        setReasoningEnabled,
      }}
    >
      {props.children}
    </ModelContext.Provider>
  );
};

export function useModel() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
}
