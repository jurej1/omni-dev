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

type AgentHistoryEntry = {
  agentName: string;
  timestamp: Date;
  messageStartIndex: number;
};

type SessionContextValue = {
  // Current state
  currentAgent: () => AgentTool.Definition | null;
  previousAgent: () => AgentTool.Definition | null;

  // Derived state
  currentAgentName: () => string;
  toolsForCurrentAgent: () => Tool[];
  instructionsForCurrentAgent: () => string;

  // History
  agentHistory: () => AgentHistoryEntry[];

  // Actions
  switchToAgent: (agentName: string) => void;
  getAgentByName: (name: string) => AgentTool.Definition | null;

  // Session metadata
  sessionStartAgent: () => string | null;
  agentSwitchCount: () => number;
};

export const SessionContext = createContext<SessionContextValue>();

const AVAILABLE_AGENTS: Record<string, AgentTool.Definition> = {
  plan: Agent.PLAN,
  build: Agent.BUILD,
};

export const SessionProvider: ParentComponent = (props) => {
  // Default to BUILD agent
  const [currentAgent, setCurrentAgent] = createSignal<AgentTool.Definition | null>(
    Agent.BUILD,
  );
  const [previousAgent, setPreviousAgent] = createSignal<AgentTool.Definition | null>(
    null,
  );
  const [agentHistory, setAgentHistory] = createSignal<AgentHistoryEntry[]>([
    {
      agentName: Agent.BUILD.name,
      timestamp: new Date(),
      messageStartIndex: 0,
    },
  ]);
  const [sessionStartAgent] = createSignal(Agent.BUILD.name);

  const currentAgentName = createMemo(() => currentAgent()?.name ?? "unknown");

  const toolsForCurrentAgent = createMemo(() => {
    const agent = currentAgent();
    return agent?.toolsList ?? [];
  });

  const instructionsForCurrentAgent = createMemo(() => {
    const agent = currentAgent();
    return agent?.instructions ?? "";
  });

  const agentSwitchCount = createMemo(() => agentHistory().length - 1);

  const switchToAgent = (agentName: string) => {
    const agent = AVAILABLE_AGENTS[agentName.toLowerCase()];

    if (!agent) {
      throw new Error(
        `Unknown agent: ${agentName}. Available agents: ${Object.keys(AVAILABLE_AGENTS).join(", ")}`,
      );
    }

    const current = currentAgent();
    if (current && current.name === agent.name) {
      return; // Already on this agent
    }

    // Update previous agent
    if (current) {
      setPreviousAgent(current);
    }

    // Update current agent
    setCurrentAgent(agent);

    // Add to history
    setAgentHistory((prev) => [
      ...prev,
      {
        agentName: agent.name,
        timestamp: new Date(),
        messageStartIndex: 0, // This will be set by the consuming code if needed
      },
    ]);
  };

  const getAgentByName = (name: string): AgentTool.Definition | null => {
    return AVAILABLE_AGENTS[name.toLowerCase()] ?? null;
  };

  return (
    <SessionContext.Provider
      value={{
        currentAgent,
        previousAgent,
        currentAgentName,
        toolsForCurrentAgent,
        instructionsForCurrentAgent,
        agentHistory,
        switchToAgent,
        getAgentByName,
        sessionStartAgent,
        agentSwitchCount,
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
