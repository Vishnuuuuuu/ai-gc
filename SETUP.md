# 🚀 Quick Setup Guide

Get your AI Group Chat running in 5 minutes!

---

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Get OpenRouter API Key
1. Visit https://openrouter.ai/keys
2. Sign up / Log in
3. Click "Create Key"
4. Copy your API key

### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your API key
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 4. Run the App
```bash
pnpm dev
```

Visit http://localhost:3000 🎉

---

## 🤖 Adding/Removing AI Models

### To Add a New Model

**Step 1:** Get the model ID from [OpenRouter Models](https://openrouter.ai/models)

**Step 2:** Add to `data/models.ts`:
```typescript
{
  id: "mistral/mistral-large",  // ← OpenRouter model ID
  displayName: "Mistral Large",
  provider: "openrouter",
  logo: "/models/mistral.png",  // ← Add logo to public/models/
  supportsImages: false,
  supportsDebate: true,
}
```

**Step 3:** Add the logo:
- Download the model's logo (32x32px PNG recommended)
- Save to `public/models/mistral.png`

**Step 4:** Add mock response (optional, for testing):
```typescript
// In data/models.ts - generateMockResponse()
"mistral/mistral-large": `Mistral Large here with my response.`,
```

That's it! The model will now appear in search.

### To Remove a Model

Just delete the model object from `data/models.ts`. Done! ✅

---

## 📁 Model Configuration File

**Location:** `ai-gc/data/models.ts`

**Structure:**
```typescript
export const AVAILABLE_MODELS: Model[] = [
  {
    id: "gpt-4o",              // OpenRouter model ID
    displayName: "GPT-4o",      // Display name in UI
    provider: "openrouter",     // Always "openrouter"
    logo: "/models/gpt.png",    // Path to logo
    supportsImages: true,       // Can handle images
    supportsDebate: true,       // Works in debate mode
  },
  // ... add more models
];
```

---

## 🔧 OpenRouter Integration

### How to Enable Real AI (Not Mock)

**Step 1:** Implement in `lib/openrouter.ts`

The stub is already there! Just uncomment and use:
```typescript
export async function sendToOpenRouter(
  modelId: string,
  messages: OpenRouterMessage[]
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Step 2:** Update the store (`store/chat-store.ts`)

Replace the mock response generation with:
```typescript
// Instead of generateMockResponse()
const aiMessage: Message = {
  id: nanoid(),
  role: "assistant",
  content: await sendToOpenRouter(modelId, conversationHistory),
  modelId,
  timestamp: new Date(),
};
```

**Step 3:** Make the store async

Change `sendMessage` to be async and handle promises.

---

## 🎨 Adding Model Logos

### Option 1: Official Logos
Download from:
- **OpenAI**: https://openai.com/brand/
- **Anthropic**: https://www.anthropic.com/
- **Google**: https://about.google/brand-resource-center/
- **xAI**: https://x.ai/

### Option 2: Quick Placeholders
Use initials that auto-show if logo doesn't load!

### Save Location
All logos go in: `ai-gc/public/models/`

### Naming Convention
- `gpt.png` - All GPT models
- `claude.png` - All Claude models
- `gemini.png` - All Gemini models
- `grok.png` - All Grok models

---

## 📊 Model ID Mapping

OpenRouter uses specific model IDs. Here's how to find them:

1. Visit https://openrouter.ai/models
2. Find your model
3. Copy the **Model ID** (e.g., `openai/gpt-4o`)
4. Use that exact ID in your config

**Examples:**
```typescript
"openai/gpt-4o"           → GPT-4o
"anthropic/claude-3-opus" → Claude 3 Opus
"google/gemini-pro"       → Gemini Pro
"x-ai/grok-beta"          → Grok Beta
```

---

## 🧪 Testing

### Mock Mode (Current)
- Works without API key
- Uses `generateMockResponse()` from `data/models.ts`
- 500ms delay between responses

### Real Mode (After Implementation)
- Requires OpenRouter API key
- Real AI responses
- Actual streaming (if implemented)

---

## 💰 Cost Tracking

OpenRouter charges per token. Check pricing:
https://openrouter.ai/models

**Tip:** Start with cheaper models like:
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-haiku`
- `google/gemini-pro`

---

## 🔒 Security

**Never commit your .env.local file!**

✅ `.env.local` is in `.gitignore`
✅ Share `.env.example` instead
✅ Keep your API key secret

---

## 🆘 Troubleshooting

### "No models showing up"
- Check `data/models.ts` has models
- Try searching for "gpt" or "claude"
- Models only show when you type

### "API key not working"
- Check `.env.local` exists (not `.env.example`)
- Restart dev server after adding key
- Verify key format: `sk-or-v1-...`

### "Logos not loading"
- Check file path: `public/models/filename.png`
- Fallback initials show automatically
- File names are case-sensitive

---

## 📚 File Structure

```
ai-gc/
├── .env.local          # Your API key (create this)
├── .env.example        # Template (committed to git)
├── data/
│   └── models.ts       # ⭐ Add/remove models here
├── public/
│   └── models/         # ⭐ Add logos here
│       ├── gpt.png
│       ├── claude.png
│       ├── gemini.png
│       └── grok.png
├── lib/
│   ├── openrouter.ts   # ⭐ Implement API calls here
│   └── orchestrator.ts # ⭐ Multi-model logic here
└── store/
    └── chat-store.ts   # ⭐ Update to use real API
```

---

## 🎯 Summary

**To get started:**
1. `pnpm install`
2. Get API key from https://openrouter.ai/keys
3. Add to `.env.local`
4. `pnpm dev`

**To add a model:**
1. Find model ID on OpenRouter
2. Add to `data/models.ts`
3. Add logo to `public/models/`

**To use real AI:**
1. Implement `lib/openrouter.ts`
2. Update `store/chat-store.ts`
3. Test!

Easy! 🚀
