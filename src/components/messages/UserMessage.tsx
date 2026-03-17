import { createMemo, For, Show } from "solid-js";
import type { UserMessage as UserMessageType } from "../../messages";
import { theme, bold, normalizePath } from "./shared";

export function UserMessage(props: { message: UserMessageType }) {
  return (
    <box
      id={"user-" + (props.message as any).id}
      border={["left"]}
      paddingX={2}
      paddingY={1}
      marginTop={1}
      flexShrink={0}
      backgroundColor={theme.backgroundPanel}
      borderColor={theme.accentUser}
      gap={1}
    >
      <text fg={theme.accentUser} attributes={bold}>
        ▶ You
      </text>
      <Show when={props.message.content.trim()}>
        <code
          drawUnstyledText={false}
          filetype="markdown"
          content={props.message.content}
          fg={theme.text}
        />
      </Show>

      <Show when={props.message.files.length > 0}>
        <For each={props.message.files}>
          {(file) => <FileTag fileName={file} />}
        </For>
      </Show>
    </box>
  );
}

function mimeColor(mimeType: string): { bg: string; fg: string } {
  if (mimeType.startsWith("image/")) return { bg: "#3D2B6B", fg: "#D2A8FF" };
  if (mimeType.startsWith("video/")) return { bg: "#3D1A1A", fg: "#FF7B72" };
  if (mimeType.startsWith("audio/")) return { bg: "#1A2E3D", fg: "#79C0FF" };
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  )
    return { bg: "#1A3D2B", fg: "#7EE787" };
  if (mimeType.startsWith("application/"))
    return { bg: "#2E2A1A", fg: "#D29922" };
  return { bg: "#1C2128", fg: "#8B949E" };
}

function FileTag(props: { fileName: string }) {
  const file = createMemo(() => Bun.file(props.fileName));
  const colors = createMemo(() => mimeColor(file().type));
  const shortType = createMemo(() => {
    const mime = file().type;
    if (!mime) return "file";
    const sub = mime.split("/")[1] ?? mime;
    return sub.split(";")[0].trim();
  });
  const displayPath = createMemo(() => normalizePath(props.fileName));

  return (
    <box flexDirection="row" width={"auto"} height={"auto"} gap={1}>
      <box backgroundColor={colors().bg} paddingX={1}>
        <text fg={colors().fg} attributes={bold}>
          {shortType()}
        </text>
      </box>
      <text fg={theme.textMuted}>{displayPath()}</text>
    </box>
  );
}
