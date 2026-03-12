import { Input } from "./components/input";
import { Messages } from "./components/messages";
import { MessagesProvider } from "./context/messages";

export function App() {
  return (
    <MessagesProvider>
      <AppShell />
    </MessagesProvider>
  );
}

function AppShell() {
  return (
    <box flexDirection="column">
      <Messages />
      <Input />
    </box>
  );
}
