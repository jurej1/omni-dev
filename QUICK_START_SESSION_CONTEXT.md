# SessionContext Quick Start Guide

## What is SessionContext?

SessionContext manages agent mode switching (PLAN/BUILD) and provides session-level state. It dynamically selects tools and instructions based on the active agent, and tags messages with agent metadata.

## Quick Examples

### Example 1: Display Current Agent Mode
```typescript
import { useSession } from "@/context/session";
import { For } from "solid-js";

export function AgentIndicator() {
  const { currentAgentName, agentHistory } = useSession();

  return (
    <div>
      <h3>Current Agent: {currentAgentName()}</h3>
      <ul>
        <For each={agentHistory()}>
          {(entry) => <li>{entry.agentName}</li>}
        </For>
      </ul>
    </div>
  );
}
```

### Example 2: Switch Agent Mode
```typescript
import { useSession } from "@/context/session";

export function AgentSelector() {
  const { switchToAgent } = useSession();

  return (
    <div>
      <button onClick={() => switchToAgent("plan")}>
        📋 Switch to PLAN Mode
      </button>
      <button onClick={() => switchToAgent("build")}>
        🔨 Switch to BUILD Mode
      </button>
    </div>
  );
}
```

### Example 3: Filter Messages by Agent
```typescript
import { useMessages } from "@/context/messages";
import { For } from "solid-js";

export function PlanPhaseMessages() {
  const { getMessagesByAgent } = useMessages();

  // Get all messages from PLAN agent
  const planMessages = () => getMessagesByAgent("plan");

  return (
    <div>
      <h3>PLAN Phase Messages</h3>
      <For each={planMessages()}>
        {(msg) => (
          <div>
            {msg.role}: {JSON.stringify(msg.content)}
          </div>
        )}
      </For>
    </div>
  );
}
```

### Example 4: Display Agent Timeline
```typescript
import { useMessages } from "@/context/messages";
import { For } from "solid-js";

export function SessionTimeline() {
  const { getSessionAgentTimeline } = useMessages();

  const timeline = () => getSessionAgentTimeline();

  return (
    <div>
      <h3>Agent Activity Timeline</h3>
      <For each={timeline()}>
        {(entry) => (
          <div>
            {entry.agent}: {entry.messageCount} messages
          </div>
        )}
      </For>
    </div>
  );
}
```

## Available Methods

### From useSession()

| Method | Returns | Description |
|--------|---------|-------------|
| `currentAgent()` | AgentTool.Definition \| null | Current active agent |
| `previousAgent()` | AgentTool.Definition \| null | Previously active agent |
| `currentAgentName()` | string | Name of current agent |
| `toolsForCurrentAgent()` | Tool[] | Tools available to current agent |
| `instructionsForCurrentAgent()` | string | System instructions for current agent |
| `agentHistory()` | AgentHistoryEntry[] | List of all agent switches |
| `sessionStartAgent()` | string \| null | Agent at session start |
| `agentSwitchCount()` | number | Total switches in session |
| `switchToAgent(name)` | void | Switch to named agent (throws if invalid) |
| `getAgentByName(name)` | AgentTool.Definition \| null | Lookup agent by name |

### From useMessages()

| Method | Returns | Description |
|--------|---------|-------------|
| `getMessagesByAgent(name)` | Message[] | Filter messages by agent |
| `getSessionAgentTimeline()` | Array<{agent, timestamp, messageCount}> | Agent activity summary |

## Agent Information

### PLAN Agent
- **Name**: "plan"
- **Purpose**: Analyze and create implementation plans
- **Tools**: read, glob, grep, list, websearch, webfetch (read-only)
- **Use**: `/plan` command or `switchToAgent("plan")`

### BUILD Agent
- **Name**: "build"
- **Purpose**: Implement plans by writing code
- **Tools**: read, glob, grep, list, websearch, webfetch, bash, edit, write (all tools)
- **Use**: `/build` command or `switchToAgent("build")`

## Common Patterns

### Pattern: Check Current Agent Before Allowing Action
```typescript
const { currentAgentName } = useSession();

function FileWriteButton() {
  const canWrite = () => currentAgentName() === "build";

  return (
    <button disabled={!canWrite()}>
      {canWrite() ? "Write File" : "Switch to BUILD to write"}
    </button>
  );
}
```

### Pattern: Track Agent Switches
```typescript
const { agentHistory, agentSwitchCount } = useSession();

function SwitchCounter() {
  return <div>Agent switches: {agentSwitchCount()}</div>;
}
```

### Pattern: Log All Agent Events
```typescript
import { useSession } from "@/context/session";
import { createEffect } from "solid-js";

export function AgentLogger() {
  const { agentHistory } = useSession();

  createEffect(() => {
    const history = agentHistory();
    history.forEach((entry) => {
      console.log(`[${entry.timestamp}] Switched to: ${entry.agentName}`);
    });
  });

  return null; // Silent logging component
}
```

## Reactive Behavior

SessionContext uses Solid.js reactivity. Changes propagate automatically:

```typescript
// When you call switchToAgent("plan"):
1. currentAgent signal updates
2. currentAgentName memo recomputes
3. toolsForCurrentAgent memo recomputes
4. OpenRouterContext auto-updates on next call
5. UI components using memos re-render with new data
```

## Error Handling

### Invalid Agent Name
```typescript
try {
  switchToAgent("invalid");
} catch (error) {
  // Error: "Unknown agent: invalid. Available agents: plan, build"
}
```

### useSession() Outside Provider
```typescript
// This will throw:
// Error: "useSession must be used within a SessionProvider"
```

## Message Metadata

All messages automatically include agent metadata:

```typescript
const { messages } = useMessages();

// Each message has metadata.agent set at creation
messages().forEach((msg) => {
  console.log(`Message by agent: ${msg.metadata?.agent}`);
});
```

## Type Definitions

```typescript
type AgentHistoryEntry = {
  agentName: string;        // "plan" or "build"
  timestamp: Date;          // When switched
  messageStartIndex: number; // Message index at switch
};

type Metadata = {
  agent?: string; // Optional agent name
};

type Message = MessageItem & {
  id: string;
  metadata?: Metadata;
};
```

## Debugging

### View Current Agent State
```typescript
const { currentAgent } = useSession();
console.log("Current agent:", currentAgent()); // Full definition
```

### View Agent Timeline
```typescript
const { agentHistory } = useSession();
console.log("Full history:", agentHistory());
```

### View Tool List for Current Agent
```typescript
const { toolsForCurrentAgent } = useSession();
console.log("Available tools:", toolsForCurrentAgent());
```

## Performance Notes

- ✅ Memos only recompute when agent changes
- ✅ No unnecessary component re-renders
- ✅ Message filtering is O(n) but acceptable
- ✅ History grows linearly (bounded per session)

## Next Steps

1. **Add UI**: Implement agent switcher in Sidepanel
2. **Add Commands**: Implement `/plan` and `/build` slash commands
3. **Add Indicator**: Show current agent mode in UI
4. **Add Tests**: Unit test SessionContext methods
5. **Monitor**: Track agent usage patterns

## Support

For questions or issues:
1. Check `docs/ARCHITECTURE_SESSION_CONTEXT.md` for detailed design
2. Review `IMPLEMENTATION_SUMMARY.md` for implementation details
3. See `src/context/session.tsx` for source code
