import { Switch, Match } from "solid-js";
import type { FunctionCallMessage } from "../../messages";
import { ToolCallBox } from "./ToolCallBox";
import { ReadCall } from "./ReadCall";
import { BashCall } from "./BashCall";
import { EditCall } from "./EditCall";
import { WriteCall } from "./WriteCall";
import { GrepCall } from "./GrepCall";
import { GlobCall } from "./GlobCall";
import { ListCall } from "./ListCall";
import { WebsearchCall } from "./WebsearchCall";
import { WebfetchCall } from "./WebfetchCall";

export function FunctionCallItem(props: { message: FunctionCallMessage }) {
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
