# 🤖 AI Group Chat

Chat with multiple AI models simultaneously. Built with Next.js 16, TypeScript, Tailwind CSS, and OpenRouter.

![AI Group Chat](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

---

## ✨ Features

- 🎯 **Multiple AI Models** - Chat with GPT-4, Claude, Gemini, Grok, and more simultaneously
- 💬 **Group Chat Mode** - All models respond to every message
- 🎭 **Debate Mode** - Watch AI models discuss and debate topics
- 🔍 **Smart Search** - Find models by name or provider
- 📜 **Chat History** - Sidebar with all your conversations
- 🎨 **ChatGPT-like UI** - Clean, familiar interface
- 🖼️ **Model Logos** - Visual model identification
- ⚡ **Mock Mode** - Test without API key

---

## 🚀 Quick Start

### 1. Install
```bash
pnpm install
```

### 2. Configure
```bash
# Copy environment template
cp .env.example .env.local

# Get API key from https://openrouter.ai/keys
# Add to .env.local:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Run
```bash
pnpm dev
```

Visit **http://localhost:3000** 🎉

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[data/HOW-TO-ADD-MODELS.md](./data/HOW-TO-ADD-MODELS.md)** - Add/remove models
- **[public/models/README.md](./public/models/README.md)** - Logo setup

---

## 🤖 Adding AI Models

**Super easy!** Just 2 steps:

1. **Find model ID** on https://openrouter.ai/models
2. **Add to** `data/models.ts`:
```typescript
{
  id: "openai/gpt-4o",
  displayName: "GPT-4o",
  provider: "openrouter",
  logo: "/models/gpt.png",
  supportsImages: true,
  supportsDebate: true,
}
```

Done! See [HOW-TO-ADD-MODELS.md](./data/HOW-TO-ADD-MODELS.md) for details.

---

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **State:** Zustand
- **AI Provider:** OpenRouter
- **Package Manager:** pnpm

---

## 📁 Project Structure

```
ai-gc/
├── app/
│   ├── create/          # Model selection page
│   ├── chat/[id]/       # Chat interface
│   └── api/chat/        # API routes (stub)
├── components/
│   └── chat/            # Chat UI components
├── data/
│   └── models.ts        # ⭐ Add models here
├── lib/
│   ├── openrouter.ts    # OpenRouter integration
│   └── orchestrator.ts  # Multi-model logic
├── store/
│   └── chat-store.ts    # Zustand state
├── types/
│   └── *.ts             # TypeScript types
└── public/
    └── models/          # Model logos
```

---

## 🎯 Current Status

### ✅ Working
- Full UI/UX
- Model selection
- Chat interface
- Mock responses
- Debate mode
- Chat history

### 🔨 To Implement
- Real OpenRouter API calls (stub ready)
- Response streaming
- Message persistence

---

## 🆘 Support

**Issues?** Check [SETUP.md](./SETUP.md)

**Questions?** Open a GitHub issue

**Want to add a model?** See [HOW-TO-ADD-MODELS.md](./data/HOW-TO-ADD-MODELS.md)

---

Made with ❤️ using Next.js and OpenRouter
