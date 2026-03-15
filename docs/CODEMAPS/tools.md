# Tools Codemap

**Last Updated:** 2026-03-15

## Tool Implementations

AI agents use these tools via OpenRouter tool calling.

## Key Modules

| Tool   | Purpose                  | Location                     |
|--------|--------------------------|------------------------------|
| bash   | Execute shell commands   | src/tools/bash/bash.ts      |
| edit   | String replacement in files | src/tools/edit/edit.ts   |
| glob   | File pattern matching    | src/tools/glob/glob.ts      |
| grep   | Content search           | src/tools/grep/grep.ts      |
| ls     | List directory           | src/tools/ls/ls.ts          |
| parse  | ?                         | src/tools/parse.ts          |
| read   | Read file content        | src/tools/read/read.ts      |
| websearch | Web search            | src/tools/websearch/        |
| webfetch | Fetch URL content     | src/tools/webfetch/         |
| write  | Write/overwrite file     | src/tools/write/write.ts    |

Exported from src/tools/index.ts

## Data Flow

Tool Call (JSON) → Execute tool → Return output → AI processes → Next action