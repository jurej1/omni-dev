import {
  createContext,
  createSignal,
  createMemo,
  ParentComponent,
  useContext,
} from "solid-js";

import { tool } from "@openrouter/sdk";
import { Agent, AgentTool } from "../utils/agent";
import { SessionUtil } from "../utils/session";

type Tool = ReturnType<typeof tool>;

const AVAILABLE_AGENTS: Record<string, AgentTool.Definition> = {
  plan: Agent.PLAN,
  build: Agent.BUILD,
};

type SessionContextValue = {
  agent: () => AgentTool.Definition;

  sessionId: () => string;

  // Actions
  switchToAgent: (agentName: string) => void;
};

export const SessionContext = createContext<SessionContextValue>();

export const SessionProvider: ParentComponent = (props) => {
  const [sessionId] = createSignal(SessionUtil.id);
  const [agent, setAgent] = createSignal<AgentTool.Definition>(Agent.BUILD);

  const switchToAgent = (agentName: string) => {
    const next = AVAILABLE_AGENTS[agentName.toLowerCase()];

    if (!next) {
      throw new Error(
        `Unknown agent: ${agentName}. Available agents: ${Object.keys(AVAILABLE_AGENTS).join(", ")}`,
      );
    }

    if (agent().name === next.name) return;

    setAgent(next);
  };

  return (
    <SessionContext.Provider
      value={{
        agent,
        sessionId,
        switchToAgent,
      }}
    >
      {props.children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
};
