import { createSignal, Show } from "solid-js";
import { useOpenRouter } from "../context/openrouter";
import { createTextAttributes } from "@opentui/core";

const boldAttributes = createTextAttributes({ bold: true });

const theme = {
  text: "#E6EDF3",
  textMuted: "#8B949E",
  accent: "#38bdf8",
  success: "#4ade80",
};
export function Sidepanel() {
  const { usage } = useOpenRouter();
  const [cwd] = createSignal(process.cwd());

  return (
    <box padding={0} flexDirection="column" height="100%" width="100%" gap={1}>
      <text fg={theme.success} attributes={boldAttributes}>
        Omni
      </text>

      <text fg={theme.textMuted}>CWD: {cwd()}</text>

      <Show
        when={usage()}
        fallback={<text fg={theme.textMuted}>No usage data</text>}
      >
        <box flexDirection="column">
          <text fg={theme.accent} attributes={boldAttributes}>
            Usage:
          </text>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.text}>Tokens:</text>
            <text fg={theme.text}>{usage()?.totalTokens}</text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.text}>Input:</text>
            <text fg={theme.text}>{usage()?.inputTokens}</text>
          </box>
          <box flexDirection="row" justifyContent="space-between">
            <text fg={theme.text}>Output:</text>
            <text fg={theme.text}>{usage()?.outputTokens}</text>
          </box>
        </box>
      </Show>
    </box>
  );
}
