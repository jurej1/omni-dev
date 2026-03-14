import { For, createMemo, Show, Switch, Match } from "solid-js";
import type { JSXElement } from "solid-js";
import { useMessages } from "../context/messages";
import {
  SyntaxStyle,
  RGBA,
  createTextAttributes,
  ScrollBoxRenderable,
} from "@opentui/core";

import type {
  FunctionCallMessage,
  FunctionCallOutputMessage,
  MessageMessage,
  ReasoningMessage,
  UserMessage,
} from "../messages";
import { Dynamic } from "@opentui/solid";

const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.3": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
});

const bold = createTextAttributes({ bold: true });

// Theme colors for nice formatting
const theme = {
  text: "#E6EDF3",
  textMuted: "#8B949E",
  background: "#010409",
  backgroundPanel: "#0D1117",
  backgroundMenu: "#161B22",
  error: "#FF7B72",
  warning: "#D29922",
};
function TextMessage(props: { message: MessageMessage }) {
  const text = createMemo(() =>
    props.message.content
      .filter((c) => c.type === "output_text")
      .map((c) => (c as { type: "output_text"; text: string }).text)
      .join(""),
  );

  return (
    <Show when={text().trim()}>
      <box
        id={"text-" + props.message.id}
        paddingLeft={3}
        marginTop={1}
        flexShrink={0}
      >
        <code
          drawUnstyledText={false}
          filetype="markdown"
          syntaxStyle={syntaxStyle}
          content={text()}
          fg={theme.text}
          streaming={true}
        />
      </box>
    </Show>
  );
}

function UserMessage(props: { message: UserMessage }) {
  return (
    <box
      id={"user-" + (props.message as any).id}
      border={["right"]}
      paddingX={2}
      paddingY={1}
      marginTop={1}
      flexShrink={0}
      backgroundColor={theme.backgroundPanel}
      borderColor="#58A6FF"
      gap={1}
    >
      <text fg="#79C0FF" attributes={bold}>
        👤 You:
      </text>
      <Show when={props.message.content.trim()}>
        <code
          drawUnstyledText={false}
          filetype="markdown"
          syntaxStyle={syntaxStyle}
          content={props.message.content}
          fg={theme.text}
        />
      </Show>
    </box>
  );
}

function parseArgs<T = Record<string, unknown>>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

function ToolCallBox(props: {
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

function ReadCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ filePath?: string; offset?: number; limit?: number }>(
      props.message.arguments,
    ),
  );
  const detail = createMemo(() => {
    const extra: string[] = [];
    if (args().offset !== undefined) extra.push(`offset=${args().offset}`);
    if (args().limit !== undefined) extra.push(`limit=${args().limit}`);
    return extra.length ? `(${extra.join(", ")})` : "";
  });
  return (
    <ToolCallBox
      icon="→"
      label={args().filePath ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}

function BashCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ command?: string }>(props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="$"
      label={args().command ?? ""}
      status={props.message.status}
    />
  );
}

function EditCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ filePath?: string; replaceAll?: boolean }>(
      props.message.arguments,
    ),
  );
  const detail = createMemo(() =>
    args().replaceAll ? "(replaceAll)" : "",
  );
  return (
    <ToolCallBox
      icon="✎"
      label={args().filePath ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}

function WriteCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ filePath?: string }>(props.message.arguments),
  );
  return (
    <ToolCallBox
      icon="+"
      label={args().filePath ?? ""}
      status={props.message.status}
    />
  );
}

function GrepCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ pattern?: string; path?: string; include?: string }>(
      props.message.arguments,
    ),
  );
  const detail = createMemo(() => {
    const parts: string[] = [];
    if (args().path) parts.push(`in ${args().path}`);
    if (args().include) parts.push(`[${args().include}]`);
    return parts.join(" ");
  });
  return (
    <ToolCallBox
      icon="⌕"
      label={args().pattern ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}

function GlobCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ pattern?: string; path?: string }>(props.message.arguments),
  );
  const detail = createMemo(() =>
    args().path ? `in ${args().path}` : "",
  );
  return (
    <ToolCallBox
      icon="*"
      label={args().pattern ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}

function ListCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ path?: string }>(props.message.arguments),
  );
  const cwd = process.cwd();
  return (
    <ToolCallBox
      icon="≡"
      label={args().path ?? cwd}
      status={props.message.status}
    />
  );
}

function WebsearchCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ query?: string; type?: string; numResults?: number }>(
      props.message.arguments,
    ),
  );
  const detail = createMemo(() => {
    const parts: string[] = [];
    if (args().type && args().type !== "auto") parts.push(args().type!);
    if (args().numResults) parts.push(`n=${args().numResults}`);
    return parts.join(" ");
  });
  return (
    <ToolCallBox
      icon="⌖"
      label={args().query ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}

function WebfetchCall(props: { message: FunctionCallMessage }) {
  const args = createMemo(() =>
    parseArgs<{ url?: string; format?: string }>(props.message.arguments),
  );
  const detail = createMemo(() =>
    args().format && args().format !== "markdown" ? `(${args().format})` : "",
  );
  return (
    <ToolCallBox
      icon="↗"
      label={args().url ?? ""}
      detail={detail()}
      status={props.message.status}
    />
  );
}

// Function call item with nice formatting
function FunctionCallItem(props: { message: FunctionCallMessage }) {
  return (
    <Switch
      fallback={
        <ToolCallBox
          icon="⚙"
          label={`${props.message.name}(${props.message.arguments})`}
          status={props.message.status}
        />
      }
    >
      <Match when={props.message.name === "read"}>
        <ReadCall message={props.message} />
      </Match>
      <Match when={props.message.name === "bash"}>
        <BashCall message={props.message} />
      </Match>
      <Match when={props.message.name === "edit"}>
        <EditCall message={props.message} />
      </Match>
      <Match when={props.message.name === "write"}>
        <WriteCall message={props.message} />
      </Match>
      <Match when={props.message.name === "grep"}>
        <GrepCall message={props.message} />
      </Match>
      <Match when={props.message.name === "glob"}>
        <GlobCall message={props.message} />
      </Match>
      <Match when={props.message.name === "list"}>
        <ListCall message={props.message} />
      </Match>
      <Match when={props.message.name === "websearch"}>
        <WebsearchCall message={props.message} />
      </Match>
      <Match when={props.message.name === "webfetch"}>
        <WebfetchCall message={props.message} />
      </Match>
    </Switch>
  );
}

function normalizePath(filepath: string): string {
  const cwd = process.cwd();
  if (filepath.startsWith(cwd)) {
    return filepath.slice(cwd.length).replace(/^\//, "");
  }
  return filepath;
}

function ReadOutput(props: { message: FunctionCallOutputMessage }) {
  const loaded = createMemo(() => {
    const val = props.message.metadata?.loaded;
    if (!Array.isArray(val)) return [];
    return val.filter((p): p is string => typeof p === "string");
  });
  const truncated = createMemo(
    () => props.message.metadata?.truncated === true,
  );
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

function BashOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ output?: string; exitCode?: number; timedOut?: boolean }>(
      props.message.output,
    ),
  );
  const summary = createMemo(() => {
    if (result().timedOut) return "timed out";
    const code = result().exitCode;
    const preview = (result().output ?? "").slice(0, 60).replace(/\n/g, " ");
    return `exit ${code ?? "?"} — ${preview || "(no output)"}`;
  });
  return <ToolOutputBox icon="$" summary={summary()} />;
}

function EditOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ success?: boolean; replacements?: number }>(
      props.message.output,
    ),
  );
  const summary = createMemo(() =>
    result().success
      ? `${result().replacements ?? 1} replacement(s) made`
      : "edit failed",
  );
  return <ToolOutputBox icon="✎" summary={summary()} />;
}

function WriteOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ path?: string; bytesWritten?: number }>(props.message.output),
  );
  const summary = createMemo(() =>
    `wrote ${normalizePath(result().path ?? "")} (${result().bytesWritten ?? 0} bytes)`,
  );
  return <ToolOutputBox icon="+" summary={summary()} />;
}

function GrepOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ total?: number; truncated?: boolean }>(props.message.output),
  );
  const summary = createMemo(() => {
    const total = result().total ?? 0;
    const trunc = result().truncated ? "+" : "";
    return `${total}${trunc} match${total !== 1 ? "es" : ""}`;
  });
  return <ToolOutputBox icon="⌕" summary={summary()} />;
}

function GlobOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ files?: string[]; truncated?: boolean }>(props.message.output),
  );
  const summary = createMemo(() => {
    const count = result().files?.length ?? 0;
    const trunc = result().truncated ? "+" : "";
    return `${count}${trunc} file${count !== 1 ? "s" : ""}`;
  });
  return <ToolOutputBox icon="*" summary={summary()} />;
}

function ListOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ truncated?: boolean }>(props.message.output),
  );
  const summary = createMemo(() =>
    `listed${result().truncated ? " (truncated)" : ""}`,
  );
  return <ToolOutputBox icon="≡" summary={summary()} />;
}

function WebsearchOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ results?: string }>(props.message.output),
  );
  const summary = createMemo(() => {
    const chars = result().results?.length ?? 0;
    return chars > 0 ? `${chars} chars returned` : "no results";
  });
  return <ToolOutputBox icon="⌖" summary={summary()} />;
}

function WebfetchOutput(props: { message: FunctionCallOutputMessage }) {
  const result = createMemo(() =>
    parseArgs<{ content?: string; contentType?: string }>(props.message.output),
  );
  const summary = createMemo(() => {
    const ct = result().contentType ?? "";
    const bytes = result().content?.length ?? 0;
    return `${bytes} chars (${ct})`;
  });
  return <ToolOutputBox icon="↗" summary={summary()} />;
}

function ToolOutputBox(props: {
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
      borderColor={theme.background}
    >
      <text paddingLeft={3} fg={theme.textMuted}>
        {props.icon} {props.summary}
      </text>
      {props.children}
    </box>
  );
}

// Function call output item with nice formatting
function FunctionCallOutputItem(props: { message: FunctionCallOutputMessage }) {
  const toolName = createMemo(
    () => (props.message.metadata?.name as string | undefined) ?? "",
  );

  return (
    <Switch
      fallback={
        <ToolOutputBox
          icon="⚙"
          summary={`[output] ${props.message.output.slice(0, 80)}`}
        />
      }
    >
      <Match when={toolName() === "read"}>
        <ReadOutput message={props.message} />
      </Match>
      <Match when={toolName() === "bash"}>
        <BashOutput message={props.message} />
      </Match>
      <Match when={toolName() === "edit"}>
        <EditOutput message={props.message} />
      </Match>
      <Match when={toolName() === "write"}>
        <WriteOutput message={props.message} />
      </Match>
      <Match when={toolName() === "grep"}>
        <GrepOutput message={props.message} />
      </Match>
      <Match when={toolName() === "glob"}>
        <GlobOutput message={props.message} />
      </Match>
      <Match when={toolName() === "list"}>
        <ListOutput message={props.message} />
      </Match>
      <Match when={toolName() === "websearch"}>
        <WebsearchOutput message={props.message} />
      </Match>
      <Match when={toolName() === "webfetch"}>
        <WebfetchOutput message={props.message} />
      </Match>
    </Switch>
  );
}

// Reasoning item with nice formatting
function ReasoningItem(props: { message: ReasoningMessage }) {
  const content = createMemo(() => {
    const text = props.message.summary
      .filter((s) => s.type === "summary_text")
      .map((s) => (s as { type: "summary_text"; text: string }).text)
      .join("");
    return `[thinking] ${text}`;
  });

  return (
    <box
      border={["left"]}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      marginTop={1}
      gap={1}
      backgroundColor={theme.backgroundMenu}
      borderColor={theme.background}
    >
      <text paddingLeft={3} fg={theme.textMuted}>
        🤔 {content()}
      </text>
    </box>
  );
}

export function Messages() {
  const { messages } = useMessages();

  let scroll: ScrollBoxRenderable;

  return (
    <scrollbox
      flexGrow={1}
      ref={(r) => (scroll = r)}
      stickyScroll={true}
      stickyStart="bottom"
    >
      <For each={messages()}>
        {(message) => {
          const component = createMemo(() => {
            switch (message.type) {
              case "message": {
                if (message.role === "user") {
                  return UserMessage;
                } else {
                  return TextMessage;
                }
              }
              case "function_call":
                return FunctionCallItem;
              case "function_call_output":
                return FunctionCallOutputItem;
              case "reasoning":
                return ReasoningItem;
              default:
                return null;
            }
          });
          return (
            <Show when={component()}>
              <Dynamic component={component()} message={message as any} />
            </Show>
          );
        }}
      </For>
    </scrollbox>
  );
}
