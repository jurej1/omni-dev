# TUI Frontend Codemap

**Last Updated:** 2026-03-15
**Framework:** Solid.js 1.9.11 + OpenTUI 0.1.87 (Terminal UI)
**Entry Point:** src/index.tsx → src/app.tsx

## Architecture

```
User Input → Messages Context → OpenRouter Call → Tool Execution → Update Messages
                    ↑
             Sidepanel (Commands/Session)
                    ↓
              Autocomplete
```

## Structure

src/
├── app.tsx # Root App with providers and shell
├── components/
│   ├── input.tsx # User input box
│   ├── messages/ # Chat messages with tool visuals
│   ├── sidepanel.tsx # Right sidebar (commands?)
│   └── ... (autocomplete, commands)
├── context/ # Solid stores
│   ├── messages.tsx
│   ├── session.tsx
│   ├── openrouter.tsx
│   ├── autocomplete.tsx
│   └── commands.tsx
└── utils/
    ├── colors.ts
    ├── file-scanner.ts # Caches cwd file list
    ├── agent.ts
    └── system.ts # System prompts

## Key Components

| Component      | Purpose                  | Location                  |
|----------------|--------------------------|---------------------------|
| App            | Providers + Layout       | src/app.tsx              |
| Messages       | Chat history w/ tools    | src/components/messages/ |
| Input          | User typing              | src/components/input.tsx |
| Sidepanel      | Commands/Session         | src/components/sidepanel.tsx |
| ToolCallBox    | Visualize tool calls     | src/components/messages/ToolCallBox.tsx |

## Data Flow

Input → Add user message → callModel → Stream: reasoning/text/tool_calls → Execute tools → Add outputs → Update UI reactively

## External Dependencies

- Solid.js 1.9.11 - Reactive UI
- @opentui/solid 0.1.87 - Terminal rendering
- @opentui/core 0.1.87 - TUI primitives (box, etc.)

## Related Areas

- [Tools](tools.md)
- [Integrations](integrations.md)