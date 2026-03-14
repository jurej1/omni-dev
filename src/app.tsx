import { Input } from "./components/input";
import { Messages } from "./components/messages";
import { Sidepanel } from "./components/sidepanel";
import { MessagesProvider } from "./context/messages";
import { OpenRouterProvider } from "./context/openrouter";
import { AutocompleteProvider } from "./context/autocomplete";

export function App() {
  return (
    <MessagesProvider>
      <OpenRouterProvider>
        <AutocompleteProvider>
          <AppShell />
        </AutocompleteProvider>
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
      paddingLeft={2}
      gap={2}
      margin={0}
    >
      <box flexDirection="column" height="100%" width={"auto"} gap={1}>
        <box flexGrow={1} height={"auto"} width={"100%"}>
          <Messages />
        </box>
        <box flexShrink={0} width={"100%"}>
          <Input />
        </box>
      </box>

      <box width={"20%"} borderStyle="single" flexShrink={0}>
        <Sidepanel />
      </box>
    </box>
  );
}
