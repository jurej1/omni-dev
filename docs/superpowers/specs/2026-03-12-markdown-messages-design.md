# Markdown Messages Design

**Date:** 2026-03-12
**Status:** Approved

## Goal

Replace plain `<text>` rendering in `TextMessage` with `<markdown>` tag (from `@opentui/solid`) so assistant and user messages render with markdown styling — headings, lists, inline code, code blocks.

## Scope

Only `TextMessage` in `src/components/messages.tsx` changes. All other message types stay as `<text>`.

| Component | Rendering | Change? |
|---|---|---|
| `TextMessage` | `<markdown>` for content | Yes |
| `FunctionCallItem` | `<text>` | No |
| `FunctionCallOutputItem` | `<text>` | No |
| `ReasoningItem` | `<text>` | No |

## Implementation

### TextMessage

Replace the single `<text>` return with a `<box>` containing a plain text prefix and a `<markdown>` element:

```tsx
function TextMessage(props: { message: MessageMessage }) {
  const prefix = props.message.role === "user" ? "[user]" : "[assistant]";
  const text = () =>
    props.message.content
      .filter((c) => c.type === "output_text")
      .map((c) => (c as { type: "output_text"; text: string }).text)
      .join("");

  return (
    <box>
      <text>{prefix}</text>
      <markdown content={text()} syntaxStyle={syntaxStyle} />
    </box>
  );
}
```

**Notes:**
- `<markdown>` is a JSX intrinsic registered by `@opentui/solid`, just like `<text>`, `<box>`, and `<scrollbox>`. No named import is needed.
- The prefix and content are now separate renderables inside a `<box>`, rendering on separate lines. The previous code inlined them as a single string (`"[user] content"`). This is an intentional visual change — the prefix label appears on its own line above the markdown content.
- If `text()` returns `""` (e.g. a message with no `output_text` content items), `<markdown>` renders nothing. This is acceptable behavior.
- Wrapping in `<box>` gives each message a vertical flex container. This matches how other block-level content is structured in `@opentui/solid` and does not affect the parent `<scrollbox>` layout.

### SyntaxStyle

Define a module-level `syntaxStyle` using GitHub Dark colors. `SyntaxStyle.fromStyles` accepts arbitrary Tree-sitter scope names; `"default"` is a recognized sentinel in `@opentui/core` that applies as the fallback style for unmatched tokens.

```tsx
import { SyntaxStyle, RGBA } from "@opentui/core";

const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.3": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
});
```

## Files Changed

- `src/components/messages.tsx` — inline change to `TextMessage` only; add `SyntaxStyle` and `RGBA` imports from `@opentui/core`

## Out of Scope

- Streaming support (`streaming` prop)
- Tool/reasoning message markdown rendering
- Custom syntax highlighting via Tree-sitter
