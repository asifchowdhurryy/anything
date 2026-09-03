# Aether Workspace 🌌
> **Modern Open-Source Notion-Like AI Workspace with Universal Multi-Model Gateway**

Aether is an extensible, privacy-focused productivity and knowledge-management workspace inspired by Notion, built for users who want to bring their own AI keys and models without vendor lock-in.

---

## ✨ Features

- 📑 **Hierarchical Pages & Sub-pages**: Create, drag, nest, and organize documents with custom icons and cover art.
- 🧱 **Rich Block-Based Editor**: Headings, paragraphs, to-dos with strikethrough, quotes, code blocks with syntax highlighting, callouts with custom emojis and colors, toggles/accordions, tables, LaTeX equations, bookmark links, images, and AI blocks.
- 📊 **Multi-View Database System**: Table, Board (Kanban), List, Calendar, and Gallery views with rich properties (Status, Select, Multi-select, Date, Person, Checkbox, Text, Number, URL).
- 🧠 **Universal AI Gateway**:
  - Connect **OpenAI, Anthropic Claude, Google Gemini, Groq, Mistral, DeepSeek, OpenRouter, Together AI, Ollama (Local AI), LM Studio (Local AI)**, and any custom OpenAI-compatible endpoint.
  - Clear privacy indicators: `🟢 Local AI` vs `🔵 Cloud AI`.
  - **In-Editor AI Assistance**: Select text or type `/ai` to improve writing, summarize, fix grammar, rewrite, make shorter/longer, or custom prompt.
  - **Workspace-Aware AI Chat**: Queries workspace pages and documents with contextual citations and sources.
  - **Global Model Selector**: Seamlessly switch between models or use `Auto` mode.
  - **AI Token & Cost Analytics**: Real-time tracking of token consumption and estimated costs.
- 🔍 **Universal Search & Command Palette**: `Cmd+K` / `Cmd+P` for instant search across pages, blocks, databases, files, and chats.
- 📁 **File Management**: Attach files to pages, extract text, and index them for AI queries.
- 💾 **Privacy & Local Persistence**: Data persists in browser storage and server state. Sensitive API keys are never exposed raw.
- 📦 **Data Portability**: Full Markdown and JSON workspace import/export.

---

## 🚀 Getting Started

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/aether-workspace.git
cd aether-workspace

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment
```bash
docker compose up -d
```

---

## 🔒 Security & Privacy

- **Bring Your Own Keys (BYOK)**: Connect your own API keys in `Settings > AI Providers`.
- **Local AI Support**: Connect local Ollama or LM Studio models (`http://localhost:11434` / `http://localhost:1234/v1`) so your data never leaves your machine.
- **Zero Raw Key Exposure**: API calls proxy through the secure local server; keys are never transmitted to third parties or logged.

---

## 📄 License

MIT © Aether Workspace Contributors.
