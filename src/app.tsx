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
    <box flexDirection="column">
      <box paddingX={2} flexGrow={1}>
        <Messages />
      </box>
      <box flexShrink={1} height={3}>
        <Input />
      </box>
    </box>
  );
}
