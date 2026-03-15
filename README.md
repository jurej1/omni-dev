# Omni Dev

[![Bun](https://img.shields.io/badge/Bun-%23FF7B00?style=for-the-badge&logo=bun.sh&logoColor=white)](https://bun.sh)
[![Solid.js](https://img.shields.io/badge/Solid.js-%23000&logo=solidjs&logoColor=fff)](https://solidjs.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-%2333ff33?style=for-the-badge&logo=openrouter&logoColor=white)](https://openrouter.ai)

Omni Dev is an open-source, terminal-based AI coding assistant powered by Grok-4.1-fast via OpenRouter. Built with Bun for blazing-fast performance, Solid.js and OpenTUI for a reactive terminal UI.

Interact with AI agents that can read/edit your codebase, run shell commands, search the web, and more—all from your terminal.

## ✨ Features

- **Reactive TUI**: Chat interface with rich tool call visualizations
- **AI Tools**: bash, edit, glob, grep, ls, read, write, websearch, webfetch
- **File Awareness**: Automatic workspace file scanning
- **Streaming Responses**: Real-time reasoning, text, and tool outputs
- **Session Management**: Persistent conversations
- **Command Palette & Autocomplete**: Efficient navigation
- **Local-First**: Runs entirely on your machine (server-side tools)

## 🚀 Quick Setup

```bash
# 1. Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# 2. Clone & Install
git clone <repo> omni-dev
cd omni-dev
bun install

# 3. Setup Environment
cp .env.example .env
# Edit .env: Add your OpenRouter API key (free tier available)
# https://openrouter.ai/keys

# 4. Run
bun run dev  # Development with hot reload
# or
bun run start  # Production
```

## 🏗️ Architecture

Detailed codemaps: [docs/CODEMAPS/INDEX.md](docs/CODEMAPS/INDEX.md)

```
TUI (OpenTUI/Solid) → OpenRouter Client → Tools (FS/Shell/Web) → Reactive Updates
```

## 📚 Documentation

- [Codemaps](docs/CODEMAPS/)
- [System Prompts](src/prompts/)
- [Tools](src/tools/)

## 🤝 Contributing

1. Fork & clone
2. `bun install`
3. `bun run dev`
4. Create feature branch
5. Submit PR

See [CONTRIBUTING.md](CONTRIBUTING.md) (create if needed).

## 📄 License

MIT (add LICENSE file)

## 🙌 Credits

- [Bun](https://bun.sh) - Fast JS/TS runtime
- [Solid.js](https://solidjs.com) - Reactive library
- [OpenTUI](https://opentui.dev) - Terminal UI
- [OpenRouter](https://openrouter.ai) - LLM API
- [Grok-4.1-fast](https://openrouter.ai/models/x-ai/grok-4.1-fast)
