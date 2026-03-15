import { Input } from "./components/input";
import { Messages } from "./components/messages";
import { Sidepanel } from "./components/sidepanel";
import { MessagesProvider } from "./context/messages";
import { SessionProvider } from "./context/session";
import { ModelProvider } from "./context/model";
import { OpenRouterProvider } from "./context/openrouter";
import { AutocompleteProvider } from "./context/autocomplete";
import { CommandsProvider } from "./context/commands";
import { Colors } from "./utils/colors";

export function App() {
  return (
    <MessagesProvider>
      <SessionProvider>
        <ModelProvider>
          <OpenRouterProvider>
            <AutocompleteProvider>
              <CommandsProvider>
                <AppShell />
              </CommandsProvider>
            </AutocompleteProvider>
          </OpenRouterProvider>
        </ModelProvider>
      </SessionProvider>
    </MessagesProvider>
  );
}

function AppShell() {
  return (
    <box
      flexDirection="row"
      height={"100%"}
      width={"100%"}
      backgroundColor={Colors.primary}
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

      <box
        width={"20%"}
        borderStyle="single"
        flexShrink={0}
        borderColor={Colors.borderColor}
      >
        <Sidepanel />
      </box>
    </box>
  );
}
