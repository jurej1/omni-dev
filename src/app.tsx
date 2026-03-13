import { Input } from "./components/input";
import { Messages } from "./components/messages";
import { Sidepanel } from "./components/sidepanel";
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
      flexDirection="row"
      height={"100%"}
      width={"100%"}
      backgroundColor={"#171717"}
      padding={2}
    >
      <box flexDirection="column" height="100%" width={"auto"} gap={2}>
        <box flexGrow={1} height={"auto"} width={"100%"}>
          <Messages />
        </box>
        <box flexShrink={1} width={"100%"}>
          <Input />
        </box>
      </box>

      <box width={"20%"} borderStyle="single">
        <Sidepanel />
      </box>
    </box>
  );
}
