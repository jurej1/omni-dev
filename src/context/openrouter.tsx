import {
  createContext,
  createSignal,
  ParentComponent,
  useContext,
} from "solid-js";
import { useMessages } from "./messages";
import { OpenRouterClient } from "../openrouter/openrouter";

type OpenRouterContextValue = {
  callModel: (message: string) => void;
  isStreaming: () => boolean;
};

export const OpenRouterContext = createContext<OpenRouterContextValue>();

export const OpenRouterProvider: ParentComponent = (props) => {
  const { addMessage } = useMessages();
  const [isStreaming, setIsStreaming] = createSignal(false);

  const callModel = async (message: string) => {
    setIsStreaming(true);
    await OpenRouterClient.callModel({
      data: message,
      callback: addMessage,
    });
    setIsStreaming(false);
  };
  return (
    <OpenRouterContext.Provider value={{ callModel, isStreaming }}>
      {props.children}
    </OpenRouterContext.Provider>
  );
};

export const useOpenRouter = () => {
  const ctx = useContext(OpenRouterContext);

  if (!ctx) {
    throw new Error("useOpenRouter must be used within an OpenRouterProvider");
  }

  return ctx;
};
