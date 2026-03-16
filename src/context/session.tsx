import {
  createContext,
  createSignal,
  createMemo,
  ParentComponent,
  useContext,
} from "solid-js";

import { tool } from "@openrouter/sdk";
import { Agent, AgentTool } from "../utils/agent";

type Tool = ReturnType<typeof tool>;

const AVAILABLE_AGENTS: Record<string, AgentTool.Definition> = {
  plan: Agent.PLAN,
  build: Agent.BUILD,
};

type SessionContextValue = {
  agent: () => AgentTool.Definition;

  // Derived state
  currentAgentName: () => string;
  toolsForCurrentAgent: () => Tool[];
  instructionsForCurrentAgent: () => string;

  // Actions
  switchToAgent: (agentName: string) => void;
};

export const SessionContext = createContext<SessionContextValue>();

export const SessionProvider: ParentComponent = (props) => {
  const [agent, setAgent] = createSignal<AgentTool.Definition>(Agent.BUILD);

  const currentAgentName = createMemo(() => agent().name);

  const toolsForCurrentAgent = createMemo(() => agent().toolsList ?? []);

  const instructionsForCurrentAgent = createMemo(
    () => agent().instructions ?? "",
  );

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
        currentAgentName,
        toolsForCurrentAgent,
        instructionsForCurrentAgent,
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
