import type { JSXElement } from "solid-js";
import { theme, dim } from "./shared";

export function ToolOutputBox(props: {
  icon: string;
  summary: string;
  children?: JSXElement;
}) {
  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundPanel}
      borderColor={theme.accentDimGray}
    >
      <text paddingLeft={3} fg={theme.textMuted} attributes={dim}>
        {props.icon} {props.summary}
      </text>
      {props.children}
    </box>
  );
}
