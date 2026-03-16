import type { FunctionCallMessage } from "../../messages";
import { ToolCallBox } from "./ToolCallBox";

export function GetTodosCall(props: { message: FunctionCallMessage }) {
  return (
    <ToolCallBox icon="✓" name="TODOS" label="get" status={props.message.status} type="meta" />
  );
}
