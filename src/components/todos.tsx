import { createSignal, onCleanup, Show, For } from "solid-js";
import { createTextAttributes } from "@opentui/core";
import { useSession } from "../context/session";
import { TodoUtil, TodoRow } from "../storage/todo";

const dim = createTextAttributes({ dim: true });
const strikethroughDim = createTextAttributes({ strikethrough: true, dim: true });

const theme = {
  text: "#E6EDF3",
  textMuted: "#6e7681",
};

export function Todos() {
  const { sessionId } = useSession();

  const [todos, setTodos] = createSignal<TodoRow[]>([]);
  TodoUtil.get(sessionId()).then(setTodos);
  const interval = setInterval(() => {
    TodoUtil.get(sessionId()).then(setTodos);
  }, 1000);
  onCleanup(() => clearInterval(interval));

  return (
    <box flexDirection="column" width="100%" gap={0}>
      <text fg={theme.textMuted} attributes={dim}>
        TODOS
      </text>
      <Show
        when={todos().length > 0}
        fallback={
          <text fg={theme.textMuted} attributes={dim}>
            no todos currently
          </text>
        }
      >
        <For each={todos()}>
          {(todo) => (
            <text
              fg={todo.status === "done" ? theme.textMuted : theme.text}
              attributes={todo.status === "done" ? strikethroughDim : undefined}
            >
              {todo.content}
            </text>
          )}
        </For>
      </Show>
    </box>
  );
}
