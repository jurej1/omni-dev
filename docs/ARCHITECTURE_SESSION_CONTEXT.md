# SessionContext Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Input (slash command or button click)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  SessionContext        │
        │  switchToAgent("plan") │
        └────────┬───────────────┘
                 │ Updates signals:
                 │ - setCurrentAgent()
                 │ - setPreviousAgent()
                 │ - setAgentHistory()
                 │
    ┌────────────┴─────────────┐
    │                          │
    ▼                          ▼
┌─────────────────┐   ┌──────────────────┐
│ currentAgent()  │   │ agentHistory()   │
│ toolsList[]     │   │ [entry, entry]   │
│ instructions    │   │                  │
└────────┬────────┘   └──────────────────┘
         │
         │ createMemo updates:
         │ - currentAgentName()
         │ - toolsForCurrentAgent()
         │ - instructionsForCurrentAgent()
         │
         ▼
┌──────────────────────────────────┐
│ OpenRouterContext                │
│ - useSession() hook              │
│ - Reads memos on each callModel()│
└────────┬─────────────────────────┘
         │
         │ Passes to callModel():
         │ - tools: toolsForCurrentAgent()
         │ - agentInstructions: instructionsForCurrentAgent()
         │ - metadata: { agent: currentAgentName() }
         │
         ▼
┌──────────────────────────────────┐
│ OpenRouterClient.callModel()     │
│ - Receives agent-specific tools  │
│ - Uses agent-specific instructions
│ - Sends to OpenRouter API        │
└────────┬─────────────────────────┘
         │
         │ Callback on item stream:
         │ callback({ ...item, metadata: { agent } })
         │
         ▼
┌──────────────────────────────────┐
│ MessagesContext.addMessage()     │
│ - Stores message with agent      │
│ - Available via getMessagesByAgent()
│ - Timeline via getSessionAgentTimeline()
└──────────────────────────────────┘
```

## State Management Architecture

### Signals (Mutable State)
- `currentAgent`: AgentTool.Definition | null
- `previousAgent`: AgentTool.Definition | null
- `agentHistory`: AgentHistoryEntry[]
- `sessionStartAgent`: string (constant)

### Memos (Derived State)
- `currentAgentName`: () => string
- `toolsForCurrentAgent`: () => Tool[]
- `instructionsForCurrentAgent`: () => string
- `agentSwitchCount`: () => number

### Context Hierarchy

```
App
├─ MessagesProvider
│  └─ SessionProvider ◄── New
│     └─ OpenRouterProvider
│        └─ AutocompleteProvider
└─ AppShell
```

**Provider Dependencies**:
- SessionProvider: Depends on MessagesProvider (uses it downstream)
- OpenRouterProvider: Depends on SessionProvider (calls useSession)

## Agent Registry

```typescript
const AVAILABLE_AGENTS: Record<string, AgentTool.Definition> = {
  plan: Agent.PLAN,
  build: Agent.BUILD,
};
```

### Agent.PLAN
- **Tools**: read, glob, grep, list, websearch, webfetch
- **Instructions**: From prompts/plan.txt
- **Purpose**: Analyze requests and produce step-by-step plans

### Agent.BUILD
- **Tools**: All tools (read, glob, grep, list, websearch, webfetch, bash, edit, write)
- **Instructions**: From prompts/build.txt
- **Purpose**: Implement plans by writing and modifying code

## Message Metadata Schema

```typescript
type Metadata = {
  agent?: string; // Agent name that produced/received the message
};
```

Applied to:
- `UserMessage`: Tagged when user sends message (currentAgentName at time of send)
- `Message` (assistant): Tagged when model responds
- `FunctionCall`: Tagged when tool is invoked
- `Reasoning`: Tagged when model reasons
- `FunctionCallOutput`: Pre-existing metadata preserved

## Usage Patterns

### Pattern 1: Agent Switching
```typescript
const { switchToAgent } = useSession();

// User triggers /plan command
switchToAgent("plan");
// OpenRouterContext automatically uses PLAN agent tools/instructions
```

### Pattern 2: Query by Agent
```typescript
const { getMessagesByAgent } = useMessages();

// Analyze only PLAN agent messages
const planMessages = getMessagesByAgent("plan");
```

### Pattern 3: Session Timeline
```typescript
const { getSessionAgentTimeline } = useMessages();

// Visualize agent usage
const timeline = getSessionAgentTimeline();
// [{ agent: "build", messageCount: 15, timestamp: Date },
//  { agent: "plan", messageCount: 8, timestamp: Date }]
```

## Reactive Behavior

### When Agent Switches
1. `switchToAgent("plan")` called
2. `currentAgent` signal updated → triggers all memos
3. `toolsForCurrentAgent` memo recomputes → new Tool[]
4. `instructionsForCurrentAgent` memo recomputes → new string
5. OpenRouterContext detects memo change (createMemo dependency)
6. Next `callModel()` call uses new agent tools/instructions

### Solid.js Reactivity
- Memos re-evaluate only when dependencies change
- No unnecessary recomputation
- Fine-grained reactivity prevents full context updates

## Type Safety

### Tool Definition
```typescript
type Tool = ReturnType<typeof tool>; // From @openrouter/sdk
```

### Agent Definition
```typescript
type AgentTool.Definition = {
  name: string;
  description: string;
  instructions: string;
  toolsList: Tool[];
};
```

### Message with Metadata
```typescript
type Message = MessageItem & {
  id: string;
  metadata?: { agent?: string };
};
```

## Validation & Error Handling

### switchToAgent Validation
```typescript
if (!agent) {
  throw new Error(
    `Unknown agent: ${agentName}. Available agents: plan, build`
  );
}
```

### Hook Guard
```typescript
const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
```

## Performance Considerations

1. **Memo Caching**: `toolsForCurrentAgent` only recomputes when `currentAgent` changes
2. **No Re-renders**: Solid.js memos don't trigger component re-renders, only necessary updates
3. **Message Filtering**: `getMessagesByAgent()` filters in-memory array (O(n) but acceptable)
4. **History Size**: `agentHistory` grows linearly with switches (bounded per session)

## Future Enhancements

1. **Agent Configuration**: Allow custom agent definitions at runtime
2. **Agent Profiles**: Save/load agent preferences
3. **Tool Permissions**: Fine-grained tool access per agent
4. **Message Analytics**: Track agent effectiveness metrics
5. **Agent Chaining**: Sequential agent execution patterns
