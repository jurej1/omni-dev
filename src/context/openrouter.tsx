import {
  createContext,
  createSignal,
  ParentComponent,
  useContext,
} from "solid-js";
import { useMessages } from "./messages";
import { useSession } from "./session";
import { useModel } from "./model";
import { OpenRouterClient } from "../openrouter/openrouter";
import type { Message } from "./messages";
import { OpenResponsesUsage } from "@openrouter/sdk/esm/models";

type OpenRouterContextValue = {
  callModel: (message: string, files: string[]) => Promise<void>;
  isStreaming: () => boolean;
  usage: () => OpenResponsesUsage | undefined;
};

export const OpenRouterContext = createContext<OpenRouterContextValue>();

export const OpenRouterProvider: ParentComponent = (props) => {
  const { addMessage, messages } = useMessages();
  const { toolsForCurrentAgent, instructionsForCurrentAgent } = useSession();
  const { selectedModel, reasoningEnabled } = useModel();
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [usage, setUsage] = createSignal<OpenResponsesUsage | undefined>(
    undefined,
  );

  const callModel = async (newMessage: string, files: string[] = []) => {
    setIsStreaming(true);

    const userMessage: Message = {
      type: "message",
      id: `user-${Date.now()}`,
      role: "user",
      content: newMessage,
      files,
    };

    addMessage(userMessage);

    try {
      await OpenRouterClient.callModel({
        model: selectedModel(),
        data: messages(),
        callback: addMessage,
        onUsageData: setUsage,
        tools: toolsForCurrentAgent(),
        agentInstructions: instructionsForCurrentAgent(),
        reasoningEnabled: reasoningEnabled(),
      });
    } catch (error: unknown) {
      const errorMessage: Message = {
        type: "message",
        id: `error-${Date.now()}`,
        role: "assistant",
        content: [
          {
            type: "output_text",
            text: `Error calling model: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
      addMessage(errorMessage);
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
