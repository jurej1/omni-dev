import { createMemo } from "solid-js";
import type { JSXElement } from "solid-js";
import { theme, bold, toolCategoryColor } from "./shared";
import type { ToolCategory } from "./shared";

export function ToolCallBox(props: {
  icon: string;
  name?: string;
  label: string;
  detail?: string;
  status?: string;
  type?: ToolCategory;
  children?: JSXElement;
}) {
  const borderColor = createMemo(() =>
    props.type ? toolCategoryColor[props.type] : theme.accentDimGray,
  );

  const statusGlyph = createMemo(() => {
    if (!props.status) return "";
    if (props.status === "in_progress") return " ◉";
    if (props.status === "completed") return " ✓";
    return " ✗";
  });

  const statusColor = createMemo(() => {
    if (props.status === "in_progress") return theme.accentBlue;
    if (props.status === "completed") return theme.accentGreen;
    return theme.error;
  });

  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundPanel}
      borderColor={borderColor()}
    >
      <box flexDirection="row" gap={1} paddingLeft={3}>
        <text fg={borderColor()} attributes={bold}>
          {props.icon}
        </text>
        {props.name && (
          <text fg={borderColor()} attributes={bold}>
            {props.name}
          </text>
        )}
        <text fg={theme.text}>
          {props.label}
          {props.detail ? ` ${props.detail}` : ""}
        </text>
        <text fg={statusColor()} attributes={bold}>
          {statusGlyph()}
        </text>
      </box>
      {props.children}
    </box>
  );
}
