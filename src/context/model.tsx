import {
  createContext,
  createSignal,
  useContext,
  createMemo,
  createResource,
  createEffect,
} from "solid-js";
import type { ParentComponent } from "solid-js";
import { OpenRouterClient } from "../openrouter/openrouter";
import { logger } from "../logger";
import { Model } from "@openrouter/sdk/esm/models";
import { PreferencesUtil } from "../storage/preferences";

export const REASONING_EFFORT_LEVELS = [
  "xhigh",
  "high",
  "medium",
  "low",
  "minimal",
  "none",
] as const;

export type ReasoningEffort = (typeof REASONING_EFFORT_LEVELS)[number];

const PAGE_SIZE = 13; // box height (15) minus 2 border rows

type ModelContextValue = {
  selectedModel: () => Model;
  setSelectedModel: (model: Model) => void;
  modelPickerVisible: () => boolean;
  setModelPickerVisible: (v: boolean) => void;
  selectedPickerIndex: () => number;
  setSelectedPickerIndex: (v: number | ((prev: number) => number)) => void;
  scrollOffset: () => number;
  filteredModels: () => Model[];
  modelsLoading: () => boolean;
  reasoningEnabled: () => boolean;
  setReasoningEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
  reasoningEffort: () => ReasoningEffort;
  setReasoningEffort: (v: ReasoningEffort) => void;
  effortPickerVisible: () => boolean;
  setEffortPickerVisible: (v: boolean) => void;
  selectedEffortIndex: () => number;
  setSelectedEffortIndex: (v: number | ((prev: number) => number)) => void;
};

const ModelContext = createContext<ModelContextValue>();

export const ModelProvider: ParentComponent = (props) => {
  const [modelsResource] = createResource<Model[]>(async () => {
    try {
      return await OpenRouterClient.listModels();
    } catch (error) {
      logger.error("Failed to fetch models:", error);
      return [];
    }
  });

  const [selectedModel, setSelectedModel] = createSignal<Model | undefined>(
    undefined,
  );
  const [modelPickerVisible, setModelPickerVisible] = createSignal(false);
  const [selectedPickerIndex, setSelectedPickerIndex] = createSignal(0);
  const [scrollOffset, setScrollOffset] = createSignal(0);
  const [reasoningEnabled, setReasoningEnabled] = createSignal(true);
  const [reasoningEffort, setReasoningEffort] =
    createSignal<ReasoningEffort>("medium");

  PreferencesUtil.getReasoningEffort().then((saved) => {
    if (
      saved &&
      (REASONING_EFFORT_LEVELS as readonly string[]).includes(saved)
    ) {
      setReasoningEffort(saved as ReasoningEffort);
    }
  });
  const [effortPickerVisible, setEffortPickerVisible] = createSignal(false);
  const [selectedEffortIndex, setSelectedEffortIndex] = createSignal(0);

  createEffect(() => {
    const idx = selectedPickerIndex();
    const offset = scrollOffset();
    if (idx < offset) {
      setScrollOffset(idx);
    } else if (idx >= offset + PAGE_SIZE) {
      setScrollOffset(idx - PAGE_SIZE + 1);
    }
  });

  createEffect(() => {
    const models = modelsResource();
    if (models && models.length > 0 && selectedModel() === undefined) {
      PreferencesUtil.getSelectedModelId().then((savedId) => {
        const match = savedId
          ? models.find((m) => m.id === savedId)
          : undefined;
        setSelectedModel(match ?? models[0]);
      });
    }
  });

  createEffect(() => {
    const model = selectedModel();
    if (model) {
      PreferencesUtil.saveSelectedModelId(model.id);
    }
  });

  createEffect(() => {
    PreferencesUtil.saveReasoningEffort(reasoningEffort());
  });

  createEffect(() => {
    if (!modelPickerVisible()) {
      setScrollOffset(0);
      setSelectedPickerIndex(0);
    }
  });

  const filteredModels = createMemo((): Model[] => {
    if (!modelPickerVisible()) return [];
    return modelsResource() ?? [];
  });

  return (
    <ModelContext.Provider
      value={{
        selectedModel,
        setSelectedModel,
        modelPickerVisible,
        setModelPickerVisible,
        selectedPickerIndex,
        setSelectedPickerIndex,
        scrollOffset,
        filteredModels,
        modelsLoading: () => modelsResource.loading,
        reasoningEnabled,
        setReasoningEnabled,
        reasoningEffort,
        setReasoningEffort,
        effortPickerVisible,
        setEffortPickerVisible,
        selectedEffortIndex,
        setSelectedEffortIndex,
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
