import {
  createContext,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import type { ParentComponent } from "solid-js";
import { useMessages } from "./messages";
import { useModel } from "./model";
import { TodoUtil } from "../storage/todo";
import { SessionUtil } from "../utils/session";

export type CommandDefinition = {
  name: string;
  description: string;
  action: () => void;
};

type CommandsContextValue = {
  commandsVisible: () => boolean;
  setCommandsVisible: (v: boolean) => void;
  commandsIndex: () => number;
  setCommandsIndex: (v: number) => void;
  commandsQuery: () => string;
  setCommandsQuery: (v: string) => void;
  selectedCommandIndex: () => number;
  setSelectedCommandIndex: (v: number | ((prev: number) => number)) => void;
  filteredCommands: () => CommandDefinition[];
};

const CommandsContext = createContext<CommandsContextValue>();

export const CommandsProvider: ParentComponent = (props) => {
  const { clearMessages } = useMessages();
  const { setModelPickerVisible, setSelectedPickerIndex } = useModel();

  const COMMANDS: CommandDefinition[] = [
    {
      name: "clear",
      description: "Clear conversation history",
      action: () => {
        clearMessages();
        TodoUtil.write(SessionUtil.id, []);
      },
    },
    {
      name: "models",
      description: "Switch the active model",
      action: () => {
        setSelectedPickerIndex(0);
        setModelPickerVisible(true);
      },
    },
  ];

  const [commandsVisible, setCommandsVisible] = createSignal(false);
  const [commandsIndex, setCommandsIndex] = createSignal(0);
  const [commandsQuery, setCommandsQuery] = createSignal("");
  const [selectedCommandIndex, setSelectedCommandIndex] = createSignal(0);

  const filteredCommands = createMemo((): CommandDefinition[] => {
    if (!commandsVisible()) return [];
    const q = commandsQuery().toLowerCase();
    if (!q) return COMMANDS.slice(0, 10);
    return COMMANDS.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 10);
  });

  return (
    <CommandsContext.Provider
      value={{
        commandsVisible,
        setCommandsVisible,
        commandsIndex,
        setCommandsIndex,
        commandsQuery,
        setCommandsQuery,
        selectedCommandIndex,
        setSelectedCommandIndex,
        filteredCommands,
      }}
    >
      {props.children}
    </CommandsContext.Provider>
  );
};

export function useCommands() {
  const ctx = useContext(CommandsContext);
  if (!ctx)
    throw new Error("useCommands must be used inside CommandsProvider");
  return ctx;
}
