import { createMemo } from "solid-js";
import type { JSXElement } from "solid-js";
import { theme } from "./shared";

export function ToolCallBox(props: {
  icon: string;
  label: string;
  detail?: string;
  status?: string;
  children?: JSXElement;
}) {
  const statusText = createMemo(() =>
    props.status ? ` (${props.status})` : "",
  );
  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundPanel}
      borderColor={theme.background}
    >
      <text paddingLeft={3} fg={theme.textMuted}>
        {props.icon} {props.label}
        {props.detail ? ` ${props.detail}` : ""}
        {statusText()}
      </text>
      {props.children}
    </box>
  );
}
