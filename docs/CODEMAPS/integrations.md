# Integrations Codemap

**Last Updated:** 2026-03-15

## OpenRouter

- Client: src/openrouter/openrouter.ts
- Model: x-ai/grok-4.1-fast
- Features: Streaming responses, parallel tool calls, reasoning content
- API Key: OPENROUTER_API_KEY
- Raw outputs saved to raw-outputs/

## Local FS

- File scanner: utils/file-scanner.ts (caches ls)
- Logger: src/logger.ts
- Outputs: raw-outputs/, outputs/