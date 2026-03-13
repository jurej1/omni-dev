import { Input } from "./components/input";
import { Messages } from "./components/messages";
import { MessagesProvider } from "./context/messages";
import { OpenRouterProvider } from "./context/openrouter";

export function App() {
  return (
    <MessagesProvider>
      <OpenRouterProvider>
        <AppShell />
      </OpenRouterProvider>
    </MessagesProvider>
  );
}

function AppShell() {
  return (
    <box
      flexDirection="column"
      height="100%"
      backgroundColor={"#171717"}
      width={"auto"}
      paddingX={2}
    >
      <box flexGrow={1} height={"90%"} width={"100%"}>
        <Messages />
      </box>
      <box flexShrink={1} height={"10%"} width={"100%"}>
        <Input />
      </box>
    </box>
  );
}
