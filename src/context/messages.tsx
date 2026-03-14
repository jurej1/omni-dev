import {
  createContext,
  createSignal,
  onCleanup,
  ParentComponent,
  useContext,
} from "solid-js";
import { type MessageItem } from "../messages";
import { logger } from "../logger";

export type Message = MessageItem & { id: string };

type MessagesContextValue = {
  messages: () => Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  getMessagesByAgent: (agentName: string) => Message[];
  getSessionAgentTimeline: () => Array<{ agent: string; timestamp: Date; messageCount: number }>;
};

export const MessagesContext = createContext<MessagesContextValue>();

export const MessagesProvider: ParentComponent = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prev) => {
      const existingIndex = prev.findIndex((m) => m.id === message.id);

      if (existingIndex === -1) {
        return [...prev, message];
      }

      const existing = prev[existingIndex];

      const updated = [...prev];
      updated[existingIndex] = { ...existing, ...message };
      return updated;
    });
  };

  onCleanup(async () => {
    //DEBUG ONLY SAVE FILE LOCALLY TO JSON.
    const current = messages();
    if (current.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `outputs/messages-${timestamp}.json`;
      await Bun.write(filename, JSON.stringify(current, null, 2));
      logger.debug("clearMessages: saved", filename);
    }
  });

  const clearMessages = () => {
    setMessages([]);
  };

  const getMessagesByAgent = (agentName: string): Message[] => {
    return messages().filter((msg) => msg.metadata?.agent === agentName);
  };

  const getSessionAgentTimeline = (): Array<{ agent: string; timestamp: Date; messageCount: number }> => {
    const timeline: Record<string, { agent: string; timestamp: Date; count: number }> = {};
    const msgList = messages();

    msgList.forEach((msg) => {
      const agent = msg.metadata?.agent || "unknown";
      if (!timeline[agent]) {
        timeline[agent] = {
          agent,
          timestamp: new Date(),
          count: 0,
        };
      }
      timeline[agent].count++;
    });

    return Object.values(timeline).map((entry) => ({
      agent: entry.agent,
      timestamp: entry.timestamp,
      messageCount: entry.count,
    }));
  };

  return (
    <MessagesContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        getMessagesByAgent,
        getSessionAgentTimeline,
      }}
    >
      {props.children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
