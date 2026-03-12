import { Input } from "./components/input";
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
      <text>This is just a test</text>
      <Input />
    </box>
  );
}
