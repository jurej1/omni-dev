import {
  createContext,
  createSignal,
  ParentComponent,
  useContext,
} from "solid-js";
import { useMessages } from "./messages";
import { OpenRouterClient } from "../openrouter/openrouter";
import type { Message } from "./messages";

type OpenRouterContextValue = {
  callModel: (message: string) => void;
  isStreaming: () => boolean;
};

export const OpenRouterContext = createContext<OpenRouterContextValue>();

export const OpenRouterProvider: ParentComponent = (props) => {
  const { addMessage, messages } = useMessages();
  const [isStreaming, setIsStreaming] = createSignal(false);

  const callModel = async (newMessage: string) => {
    setIsStreaming(true);

    const userMessage: Message = {
      type: "message",
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
    };

    addMessage(userMessage);

    // Call model with full message history
    await OpenRouterClient.callModel({
      data: messages(),
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
