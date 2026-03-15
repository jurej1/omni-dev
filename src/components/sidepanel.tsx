import { createSignal, onCleanup, Show } from "solid-js";
import { useOpenRouter } from "../context/openrouter";
import { createTextAttributes } from "@opentui/core";
import { Colors } from "../utils/colors";

const bold = createTextAttributes({ bold: true });
const dim = createTextAttributes({ dim: true });

const theme = {
  text: "#E6EDF3",
  textMuted: "#6e7681",
  accent: Colors.streamingColor,
  success: "#4ade80",
  warning: "#f59e0b",
  divider: "#21262d",
};

const STATUS_FRAMES = ["◆", "◇"];

function StatusPulse() {
  const [frame, setFrame] = createSignal(0);
  const interval = setInterval(() => {
    setFrame((f) => (f + 1) % STATUS_FRAMES.length);
  }, 600);
  onCleanup(() => clearInterval(interval));

  return (
    <text fg={theme.success} attributes={bold}>
      {STATUS_FRAMES[frame()]}
    </text>
  );
}

function StatRow(props: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <box flexDirection="row" justifyContent="space-between" width="100%">
      <text fg={theme.textMuted} attributes={dim}>
        {props.label}
      </text>
      <text fg={props.accent ? theme.accent : theme.text} attributes={bold}>
        {props.value}
      </text>
    </box>
  );
}

export function Sidepanel() {
  const { usage, isStreaming } = useOpenRouter();
  const [cwd] = createSignal(process.cwd().split("/").slice(-2).join("/"));

  const totalTokens = () => usage()?.totalTokens ?? 0;
  const inputTokens = () => usage()?.inputTokens ?? 0;
  const outputTokens = () => usage()?.outputTokens ?? 0;

  return (
    <box padding={1} flexDirection="column" height="100%" width="100%" gap={1}>
      {/* Header */}
      <box flexDirection="row" gap={1} alignItems="center">
        <StatusPulse />
        <text fg={theme.success} attributes={bold}>
          OMNI
        </text>
      </box>

      {/* Status */}
      <box flexDirection="row" justifyContent="space-between" width="100%">
        <text fg={theme.textMuted} attributes={dim}>
          STATUS
        </text>
        <Show
          when={isStreaming()}
          fallback={
            <text fg={theme.success} attributes={bold}>
              IDLE
            </text>
          }
        >
          <text fg={theme.warning} attributes={bold}>
            STREAMING
          </text>
        </Show>
      </box>

      {/* CWD */}
      <box flexDirection="column" width="100%">
        <text fg={theme.textMuted} attributes={dim}>
          CWD
        </text>
        <text fg={theme.text}>~/{cwd()}</text>
      </box>

      {/* Usage */}
      <box flexDirection="column" width="100%" gap={0}>
        <text fg={theme.textMuted} attributes={dim}>
          TOKENS
        </text>

        <StatRow label="total" value={totalTokens()} accent />
        <StatRow label="in" value={inputTokens()} />
        <StatRow label="out" value={outputTokens()} />
      </box>

      {/* Footer */}
      <text fg={theme.textMuted} attributes={dim}>
        x-ai/grok-4.1-fast
      </text>
    </box>
  );
}
