# Omni-Dev AGENTS.md

This guide is for agentic coding agents (e.g., plan/build/explore modes) working in this repo.
Follow these rules to maintain consistency. ~150 lines.

## 🚀 Build & Run Commands

- Install deps: `bun install`
- Dev server (hot reload): `bun run dev` or `bun --watch src/index.tsx`
- Production build/run: `bun run start` or `bun src/index.tsx`
- Type check: `bun tsc --noEmit` (uses tsconfig.json)
- Bundle/analyze (if needed): `bun build src/index.tsx --target=bun --outfile=dist/index.js`

No minify/release scripts yet. Add if requested.

**Bun-specific:**
- Uses Bun runtime (fast JS/TS).
- `bunfig.toml`: Preloads `@opentui/solid/preload` for TUI perf.
- No npm/yarn; stick to Bun.

## 🔍 Lint & Format

**No configs yet** (no .eslintrc, .prettierrc).

**Inferred style (enforce manually):**
- Run `bunx prettier --write .` or `bunx eslint . --fix` if added.
- TS formatting: 2-space indent, single quotes, trailing commas.
- Follow Bun's auto-format: `bun format` (implicit in editor).

**Add if needed:**
```
bun add -D prettier eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## 🧪 Tests

**No tests in repo** (no `*.test.ts`, no vitest/jest config).

**Setup (if adding tests):**
- Add Vitest (Bun-compatible): `bun add -D vitest @vitest/ui`
- Config: `vitest.config.ts` with `test: { environment: 'bun' }`
- Run all: `bun test`
- Single test: `bun test path/to/file.test.ts`
- Watch: `bun test --watch`
- Coverage: `bun test --coverage`

**Example test file:** `src/utils/__tests__/agent.test.ts`
```ts
import { describe, it, expect } from 'bun:test'; // or vitest
describe('Agent', () => {
  it('defines PLAN', () => {
    expect(Agent.PLAN).toBeDefined();
  });
});
```

Use `bun:test` globals for speed (no imports needed).

## 💻 Code Style Guidelines

### Imports
```
# Order (top to bottom):
1. Node/Bun builtins: \"fs\", \"path\", \"crypto\"
2. External: \"solid-js\", \"@openrouter/sdk\", \"zod\", \"drizzle-orm\"
3. Relative internals: \"./logger\", \"../context/model\"
4. Side-effect: Last, e.g. import '../types';

# Style:
- One import per line (no multi).
- No @/src alias (use relatives).
- Dynamic imports rare.
- Barrel exports: index.ts for components/tools.

Examples from codebase:
```ts
import { createSignal } from \"solid-js\";
import { useSession } from \"../context/session\";
import { Colors } from \"../utils/colors\";
```
```

### Formatting & Layout
- **Indent:** 2 spaces.
- **Quotes:** Single (`'`) preferred, double for JSX.
- **Semicolons:** Always.
- **Trailing commas:** In objects/arrays/functions (ES2022+).
- **Line length:** 100 chars max.
- **JSX:** Self-closing `<box />`. Preserve (tsconfig: jsx: \"preserve\").
- **No unused imports/vars** (TS strict later).

**Solid.js:**
- Reactive: `createSignal`, `createMemo`, `createEffect`.
- No classes. Functions only.
- `<For>`, `<Show>`, `<Index>` for lists.
- `props` as first arg.

### Types & Typing
- **tsconfig.json:** jsxImportSource: \"@opentui/solid\", esModuleInterop, allowJs.
- Inline types: `type Msg = { id: string; }`
- Zod schemas: For tools/inputs (e.g. `z.object({...})`).
- Generics: `<T extends string>`
- No `any/unknown` unless boundary (user input).
- Export types: `export type AgentTool.Definition`

**Strict mode:** Add later: strict: true, noImplicitAny: true.

### Naming Conventions
| Category | Convention | Examples |
|----------|------------|----------|
| Components | PascalCase | `App`, `Messages`, `Sidepanel` |
| Hooks | camelCase, use* | `useSession`, `useModel` |
| Signals | camelCase | `isOpen`, `todos` |
| Functions | camelCase | `renderApp`, `handleSubmit` |
| Vars/Props | camelCase | `messageId`, `userInput` |
| Types/Interfaces | PascalCase | `MessageItem`, `ToolCall` |
| Constants | UPPER_SNAKE | `REASONING_EFFORT_LEVELS` |
| Files | kebab-case (utils), Pascal (components) | `file-scanner.ts`, `ModelPicker.tsx` |

### Error Handling
- **Minimal:** Trust internals (Bun/Solid). No try/catch unless:
  - User input (Zod parse).
  - FS/API (e.g. `if (!file) return;`).
- Log errors: `logger.error(...)`
- No throw; graceful fallbacks.
- Tool errors: Return Zod-safe outputs.

Examples:
```ts
const data = schema.parse(input); // Throws/parses safely
if (!existsSync(path)) {
  logger.warn(`File missing: ${path}`);
  return null;
}
```

### Components & Patterns
- **Context:** Providers nest: Messages > Session > Model > OpenRouter > etc.
- **Tools:** `@openrouter/sdk` `tool()` wrappers in `src/tools/`.
- **TUI:** OpenTUI/Solid: `<box>`, flexDirection, padding, Colors.
- **Reactivity:** Access signals in `createEffect`/track.
- **No side-effects in render:** Use onMount/effects.

**Agents (you!):**
- BUILD: Edit minimal, read first (`read` tool).
- PLAN: Step-by-step, no code.
- EXPLORE: Glob/grep/read.
- Reuse utils: `src/utils/*`
- No new deps without PR.

### Git Hygiene
- Commit: `git add . && git commit -m \"feat: add X\"`
- No force-push. Branch: `feat/agent-guide`
- Dirty tree: Ignore unrelated changes.

## 📝 Quick Checklist
- [ ] Read file before edit.
- [ ] Match existing style (grep patterns).
- [ ] No premature abstractions.
- [ ] Test manually: `bun run dev`
- [ ] ~150 lines? Trim if verbose.

Last updated: Analyze current state. Improve as repo evolves.
