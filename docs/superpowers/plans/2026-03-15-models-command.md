# Models Command Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/models` command that lets users pick from a predefined list of models, replacing the hardcoded model in `openrouter.ts`.

**Architecture:** A new `ModelContext` holds the selected model as a reactive signal. `openrouter.ts` reads the current model from context instead of a hardcoded string. The `/models` command action opens a model-picker overlay (a second autocomplete-style UI) reusing the existing commands UI pattern.

**Tech Stack:** SolidJS, @opentui/core, existing commands/autocomplete patterns

---

## Chunk 1: ModelContext

### Task 1: Create `src/context/model.tsx`

**Files:**
- Create: `src/context/model.tsx`

- [ ] **Step 1: Write the file**

```tsx
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
};

const ModelContext = createContext<ModelContextValue>();

export const ModelProvider: ParentComponent = (props) => {
  const [selectedModel, setSelectedModel] = createSignal<ModelId>(
    AVAILABLE_MODELS[0],
  );
  const [modelPickerVisible, setModelPickerVisible] = createSignal(false);
  const [selectedPickerIndex, setSelectedPickerIndex] = createSignal(0);

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
```

- [ ] **Step 2: Commit**

```bash
git add src/context/model.tsx
git commit -m "feat: add ModelContext with selected model signal"
```

---

## Chunk 2: Wire ModelProvider into the app + pass model to callModel

### Task 2: Wrap app with `ModelProvider` in `src/app.tsx`

**Files:**
- Modify: `src/app.tsx`

- [ ] **Step 1: Add import**

In `src/app.tsx` add after the existing imports:
```tsx
import { ModelProvider } from "./context/model";
```

- [ ] **Step 2: Move ModelProvider to wrap OpenRouterProvider**

`OpenRouterProvider` calls `useModel()` (Task 4), so `ModelProvider` must be an ancestor of it — not just `CommandsProvider`. Change the provider tree from:
```tsx
<MessagesProvider>
  <SessionProvider>
    <OpenRouterProvider>
      <AutocompleteProvider>
        <CommandsProvider>
          <AppShell />
        </CommandsProvider>
      </AutocompleteProvider>
    </OpenRouterProvider>
  </SessionProvider>
</MessagesProvider>
```
To:
```tsx
<MessagesProvider>
  <SessionProvider>
    <ModelProvider>
      <OpenRouterProvider>
        <AutocompleteProvider>
          <CommandsProvider>
            <AppShell />
          </CommandsProvider>
        </AutocompleteProvider>
      </OpenRouterProvider>
    </ModelProvider>
  </SessionProvider>
</MessagesProvider>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/app.tsx
git commit -m "feat: mount ModelProvider in app tree"
```

---

### Task 3: Use `selectedModel` in `src/openrouter/openrouter.ts`

**Files:**
- Modify: `src/openrouter/openrouter.ts`

The `callModel` function currently hardcodes `const model = "x-ai/grok-4.1-fast"`. We need to accept `model` as a parameter.

- [ ] **Step 1: Add `model` parameter to `callModel`**

Change the function signature from:
```ts
export async function callModel({
  data,
  callback,
  onUsageData,
  tools: overrideTools,
  agentInstructions,
}: {
  data: Message[];
  callback: (msg: Message) => void;
  onUsageData: (data: OpenResponsesUsage) => void;
  tools?: Tool[];
  agentInstructions?: string;
})
```
To:
```ts
export async function callModel({
  data,
  callback,
  onUsageData,
  tools: overrideTools,
  agentInstructions,
  model,
}: {
  data: Message[];
  callback: (msg: Message) => void;
  onUsageData: (data: OpenResponsesUsage) => void;
  tools?: Tool[];
  agentInstructions?: string;
  model: string;
})
```

- [ ] **Step 2: Remove hardcoded model constant**

Remove the line:
```ts
const model = "x-ai/grok-4.1-fast";
```
(The `model` param is now used directly.)

Do NOT commit yet — TypeScript will error until Task 4 wires up the call site.

---

### Task 4: Pass `selectedModel` from `OpenRouterProvider` to `callModel`

**Files:**
- Modify: `src/context/openrouter.tsx`

- [ ] **Step 1: Import `useModel`**

Add to imports in `src/context/openrouter.tsx`:
```tsx
import { useModel } from "./model";
```

- [ ] **Step 2: Consume `selectedModel` inside the provider**

After the existing `const { toolsForCurrentAgent, instructionsForCurrentAgent } = useSession();` line, add:
```tsx
const { selectedModel } = useModel();
```

- [ ] **Step 3: Pass `model` to `callModel`**

Inside `callModel`, change:
```ts
await OpenRouterClient.callModel({
  data: messages(),
  callback: addMessage,
  onUsageData: setUsage,
  tools: toolsForCurrentAgent(),
  agentInstructions: instructionsForCurrentAgent(),
});
```
To:
```ts
await OpenRouterClient.callModel({
  data: messages(),
  callback: addMessage,
  onUsageData: setUsage,
  tools: toolsForCurrentAgent(),
  agentInstructions: instructionsForCurrentAgent(),
  model: selectedModel(),
});
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Commit both openrouter files together**

```bash
git add src/openrouter/openrouter.ts src/context/openrouter.tsx
git commit -m "feat: accept and pass selectedModel into callModel"
```

---

## Chunk 3: Model picker UI component

### Task 5: Create `src/components/model-picker.tsx`

**Files:**
- Create: `src/components/model-picker.tsx`

- [ ] **Step 1: Write the component**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/model-picker.tsx
git commit -m "feat: add ModelPicker overlay component"
```

---

## Chunk 4: Wire `/models` command + picker into Input

### Task 6: Add `/models` command to `src/context/commands.tsx`

**Files:**
- Modify: `src/context/commands.tsx`

`CommandsProvider` calls `useModel()` directly — `ModelProvider` is an ancestor in the tree so the context is available.

- [ ] **Step 1: Import `useModel` in `src/context/commands.tsx`**

Add to the existing imports:
```tsx
import { useModel } from "./model";
```

- [ ] **Step 2: Call `useModel` inside the provider and add the command**

After `const { clearMessages } = useMessages();`, add the `useModel` destructure **before** the `COMMANDS` array — the command actions close over these setters, so they must be declared first:
```tsx
const { setModelPickerVisible, setSelectedPickerIndex } = useModel();
```

Change the `COMMANDS` array from:
```ts
const COMMANDS: CommandDefinition[] = [
  {
    name: "clear",
    description: "Clear conversation history",
    action: clearMessages,
  },
];
```
To:
```ts
const COMMANDS: CommandDefinition[] = [
  {
    name: "clear",
    description: "Clear conversation history",
    action: clearMessages,
  },
  {
    name: "models",
    description: "Switch the active model",
    action: () => {
      setSelectedPickerIndex(0);
      setModelPickerVisible(true);
    },
  },
];
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/context/commands.tsx
git commit -m "feat: add /models command that opens model picker"
```

---

### Task 7: Integrate `ModelPicker` into `src/components/input.tsx`

**Files:**
- Modify: `src/components/input.tsx`

- [ ] **Step 1: Add imports**

Add to imports in `src/components/input.tsx`:
```tsx
import { ModelPicker } from "./model-picker";
import { useModel } from "../context/model";
import type { ModelId } from "../context/model";
```

- [ ] **Step 2: Consume model context in `Input()`**

After the `useCommands()` destructure, add:
```tsx
const {
  selectedModel,
  setSelectedModel,
  modelPickerVisible,
  setModelPickerVisible,
  selectedPickerIndex,
  setSelectedPickerIndex,
  filteredModels,
} = useModel();
```

Note: `selectedModel` is included here so Task 8's status bar can use it without modifying the destructure again.

- [ ] **Step 3: Add `handleModelSelect` handler**

After `handleCommandSelect`, add:
```tsx
const handleModelSelect = (model: ModelId) => {
  setSelectedModel(model);
  setModelPickerVisible(false);
};
```

- [ ] **Step 4: Handle keyboard navigation for model picker in `handleKeyDown`**

Inside `handleKeyDown`, insert the new block as the **very first check** — before `if (name === "tab")`. This ensures the model picker captures all keys before the commands or autocomplete handlers run:

```tsx
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
```

- [ ] **Step 5: Render `ModelPicker` in JSX**

Inside the `<box flexGrow={1}>` that already contains `FileAutocomplete` and `CommandsAutocomplete`, add:
```tsx
<Show when={modelPickerVisible()}>
  <ModelPicker onSelect={handleModelSelect} />
</Show>
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/input.tsx
git commit -m "feat: integrate ModelPicker into Input with keyboard navigation"
```

---

## Chunk 5: Show active model in status bar

### Task 8: Display selected model name in the input status bar

**Files:**
- Modify: `src/components/input.tsx`

The bottom status bar currently shows agent info and hints. We should show the active model name there.

- [ ] **Step 1: Import `useModel` if not already imported** (already done in Task 7)

- [ ] **Step 2: Add model display to the status bar**

The status bar is inside the `fallback` prop of the `<Show when={isStreaming()}>` block (the non-streaming branch). It is the second `<box>` inside that fallback — the one with `flexDirection="row"` and `paddingLeft={1}` that shows the agent sigil and hints.

Find this exact text node (it is the last `<text>` in that box):

```tsx
<text fg={Colors.blueGray} attributes={dimAttributes}>
  tab to switch · @ for files · / for commands · enter to send
</text>
```

Add after it (still inside the same `<box>`):
```tsx
<text fg={Colors.blueGray} attributes={dimAttributes}>
  │
</text>
<text fg={Colors.blueGray} attributes={dimAttributes}>
  {selectedModel()}
</text>
```

This displays the raw model ID string (e.g. `x-ai/grok-4.1-fast`) next to the existing hints.

Note: `selectedModel` was already added to the destructure in Task 7 Step 2.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/input.tsx
git commit -m "feat: show active model in input status bar"
```
