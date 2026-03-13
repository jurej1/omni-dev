import {
  createContext,
  createSignal,
  ParentComponent,
  useContext,
} from "solid-js";
import { useMessages } from "./messages";
import { OpenRouterClient } from "../openrouter/openrouter";
import type { Message } from "./messages";
import { OpenResponsesUsage } from "@openrouter/sdk/esm/models";

type OpenRouterContextValue = {
  callModel: (message: string) => void;
  isStreaming: () => boolean;
  usage: () => OpenResponsesUsage | undefined;
};

export const OpenRouterContext = createContext<OpenRouterContextValue>();

export const OpenRouterProvider: ParentComponent = (props) => {
  const { addMessage, messages } = useMessages();
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [usage, setUsage] = createSignal<OpenResponsesUsage | undefined>(
    undefined,
  );

  const callModel = async (newMessage: string) => {
    setIsStreaming(true);

    const userMessage: Message = {
      type: "message",
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
    };

    addMessage(userMessage);

    try {
      await OpenRouterClient.callModel({
        data: messages(),
        callback: addMessage,
        onUsageData: setUsage,
      });
    } catch (error) {
      console.error("Error calling model:", error);
    } finally {
      setIsStreaming(false);
    }
  };
  return (
    <OpenRouterContext.Provider value={{ callModel, isStreaming, usage }}>
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
