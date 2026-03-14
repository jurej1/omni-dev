import { createMemo, Switch, Match } from "solid-js";
import type { FunctionCallOutputMessage } from "../../messages";
import { ToolOutputBox } from "./ToolOutputBox";
import { ReadOutput } from "./ReadOutput";
import { BashOutput } from "./BashOutput";
import { EditOutput } from "./EditOutput";
import { WriteOutput } from "./WriteOutput";
import { GrepOutput } from "./GrepOutput";
import { GlobOutput } from "./GlobOutput";
import { ListOutput } from "./ListOutput";
import { WebsearchOutput } from "./WebsearchOutput";
import { WebfetchOutput } from "./WebfetchOutput";

export function FunctionCallOutputItem(props: {
  message: FunctionCallOutputMessage;
}) {
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
