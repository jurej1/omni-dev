import { createContext, createSignal, ParentComponent } from "solid-js";
import { type MessageItem } from "../messages";

export type Message = MessageItem & { id: string };

type MessagesContextValue = {
  messages: () => Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
};

export const MessagesContext = createContext<MessagesContextValue>();

export const MessagesProvider: ParentComponent = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([]);

  const addMessage = (message: Message) => {
    const doesContainMessage = messages().some((m) => m.id === message.id);
    if (!doesContainMessage) {
      setMessages((prev) => [...prev, message]);
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, ...message } : m)),
      );
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <MessagesContext.Provider value={{ messages, addMessage, clearMessages }}>
      {props.children}
    </MessagesContext.Provider>
  );
};
