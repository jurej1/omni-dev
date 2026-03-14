import { createMemo, For } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ReadMetadataSchema } from "../../tools";
import { theme, normalizePath } from "./shared";
import { ToolOutputBox } from "./ToolOutputBox";

export function ReadOutput(props: { message: FunctionCallOutputMessage }) {
  const metadata = createMemo(
    () =>
      ReadMetadataSchema.safeParse(props.message.metadata).data ?? {
        preview: "",
        truncated: false,
        loaded: [],
      },
  );
  const loaded = createMemo(() => metadata().loaded);
  const truncated = createMemo(() => metadata().truncated);
  return (
    <ToolOutputBox
      icon="→"
      summary={
        loaded().length > 0
          ? `${normalizePath(loaded()[0])}${truncated() ? " (truncated)" : ""}`
          : "reading..."
      }
    >
      <For each={loaded()}>
        {(filepath) => (
          <box paddingLeft={3}>
            <text paddingLeft={3} fg={theme.textMuted}>
              ↳ Loaded {normalizePath(filepath)}
            </text>
          </box>
        )}
      </For>
    </ToolOutputBox>
  );
}
