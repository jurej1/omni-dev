import type { FunctionCallMessage } from "../../messages";
import { ToolCallBox } from "./ToolCallBox";

export function GetTodosCall(props: { message: FunctionCallMessage }) {
  return (
    <ToolCallBox icon="✓" label="get todos" status={props.message.status} />
  );
}
