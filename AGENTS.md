# Omni-Dev AGENTS.md

This guide is for agentic coding agents working in the `omni-dev` repository. Follow these conventions strictly to maintain consistency.

## 🚀 Build, Lint, Test Commands

### Development Server
- `bun run dev` or `bun --watch src/index.tsx`: Hot-reload dev server for the SolidJS app.
- `bun run start` or `bun src/index.tsx`: Production-like build/run.

### Testing (Bun Test Runner)
- All tests: `bun test`
- Specific file: `bun test src/events/questions.test.ts`
- Single test by name: `bun test --test-name-pattern="publishQuestionsAsk"`
- Specific describe/it: `bun test src/events/questions.test.ts --test-name-pattern="questions events"`
- With coverage: `bun test --coverage`
- Update snapshots: `bun test -u`
- Run only failing tests: Bun supports `--only` for `test.only()` or `describe.only()`.
- Parallel by default; use `--bail=1` to stop on first failure.
- Tests use `bun:test` (describe, it, expect, beforeEach).

No separate build step; Bun bundles/transpiles on-the-fly. No TypeScript compiler in CI; relies on `tsconfig.json` + Bun's TS support.

### Linting & Formatting
- **No ESLint/Prettier/Biome configs found.** Use manual formatting matching existing code.
- Run `bunx prettier --check .` if installed, but prefer visual consistency.
- Type checking: `bun tsc --noEmit` (implicit via tsconfig.json).

### Other Utils
- Install deps: `bun install`
- Clean: `rm -rf node_modules bun.lockb && bun install`
- Logs: Tail `omni-dev.log` for runtime logs.

## 💻 Code Style Guidelines

### Language & Framework
- TypeScript + SolidJS + @opentui/solid (CLI/TUI renderer).
- JSX: `preserve` mode, `jsxImportSource: "@opentui/solid"`.
- Runtime: Bun 1.3+ (fastest JS runtime).

### Imports
```
# Grouped by category (matching app.tsx/index.tsx):
# 1. Local utils/logger/bus
import { logger } from "./logger";
# 2. Components (relative)
import { App } from "./app";
import { Input } from "./components/input";
# 3. External deps (solid-js, zod, etc.)
import { createMemo, Show } from "solid-js";
import { z } from "zod";
# 4. Absolute/aliases: None; all relative.
```
- Single line per import unless long destructured.
- No side-effect imports unless necessary.
- Prefer named exports: `export function Component() {}`.
- Re-export sparingly: `export { X } from "./x";`.

### Naming Conventions
| Element | Convention | Examples |
|---------|------------|----------|
| Components | PascalCase | `TextMessage`, `AppShell` |
| Functions/Events | camelCase | `publishQuestionsAsk`, `createMemo` |
| Variables/Props | camelCase | `props.message`, `received` |
| Constants | UPPER_SNAKE_CASE (rare) | `LOG_PATH` |
| Types/Interfaces | PascalCase | `MessageMessage` |
| Files | kebab-case (src/) or PascalCase (components) | `questions.test.ts`, `TextMessage.tsx` |

### Formatting & Structure
- Indent: 2 spaces (matching existing).
- Lines: <100 chars; break long ones.
- Components: Single responsibility; <100 lines preferred.
  ```
  export function Component(props: Props) {
    const memo = createMemo(() => compute());
    return (
      <Show when={cond}>
        <box attr={val}>{children}</box>
      </Show>
    );
  }
  ```
- No semicolons in JS/TS (ASI safe).
- Trailing commas in objects/arrays/functions.
- No unused imports/vars (Bun warns).

### Types & TypeScript
- Explicit types everywhere: `props: { message: MessageMessage }`.
- Infer primitives: `let count = 0`.
- Zod for runtime validation (events/bus): `Bus.register("event", z.array(z.string()))`.
- No `any/unknown` unless external API.
- Generics: `<T>` where needed.
- tsconfig.json: `skipLibCheck: true`, `esModuleInterop: true`, `allowJs: true`.

### Error Handling
- Trust types/Zod; minimal try/catch.
- Logger for debugging: `logger.log("msg", data); logger.error("err")`.
- Tests: `expect(() => fn()).toThrow()`; `expect(fn()).toEqual(expected)`.
- No panics; graceful degradation (e.g., `<Show when={text().trim()}>`).

### Components & SolidJS Patterns
- Memoize computed values: `createMemo(() => ...)`.
- Conditional: `<Show when={truthy}>...</Show>`.
- Box-based layout: `flexDirection="row"`, `height="100%"`, `gap={2}`.
- Props: Destructured typed interfaces.
- No effects unless side-effects (use `onMount`).

### Testing Patterns
```
import { describe, it, expect, beforeEach } from "bun:test";
describe("module", () => {
  beforeEach(() => { Bus.clear(); /* reset */ });
  it("desc", () => { expect(fn()).toBeTruthy(); });
});
```
- Mock globals minimally.
- Test Zod validation: `expect(() => invalid()).toThrow()`.

### Git & Hygiene
- Commit often: `git add . && git commit -m "feat: add X"`.
- No force-push without approval.
- Branch: `feat/agents-md`.

### Prohibited
- No new deps without approval.
- No auto-formatters/linters until configured.
- No React/Vue interop.
- No class components.

Follow existing patterns in `src/components/messages/*.tsx` and `src/events/*.ts`.

Length: ~150 lines. Last update: $(date).
