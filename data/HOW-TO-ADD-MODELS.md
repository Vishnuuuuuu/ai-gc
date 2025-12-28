# 🤖 How to Add/Remove AI Models

Super simple guide!

---

## ➕ Add a Model (3 steps)

### Step 1: Find the Model ID
Visit https://openrouter.ai/models and copy the model ID

**Examples:**
- `openai/gpt-4o`
- `anthropic/claude-3-opus`
- `meta-llama/llama-3-70b`

### Step 2: Add to models.ts
Open `data/models.ts` and add:

```typescript
{
  id: "your-model-id-here",     // From Step 1
  displayName: "Model Name",    // What users see
  provider: "openrouter",       // Always this
  logo: "/models/logo.png",     // Your logo file
  supportsImages: false,        // true if model handles images
  supportsDebate: true,         // Always true
},
```

### Step 3: Add Logo (optional)
- Download logo (32x32px PNG)
- Save to `public/models/logo.png`
- If you skip this, initials show automatically!

**Done!** ✅

---

## ➖ Remove a Model

1. Open `data/models.ts`
2. Delete the model object
3. Done!

---

## 📋 Quick Copy Template

```typescript
{
  id: "",
  displayName: "",
  provider: "openrouter",
  logo: "/models/.png",
  supportsImages: false,
  supportsDebate: true,
},
```

---

## 🎨 Logo Tips

**Where to get logos:**
- Search "[model name] logo PNG" on Google
- Check official brand pages
- Use https://logoipsum.com for placeholders

**Requirements:**
- PNG format (transparent background)
- 32x32px or larger
- Save to `public/models/`

**Don't have a logo?**
No problem! The UI shows initials automatically.

---

## 🔍 Finding Model IDs

### OpenRouter Model Browser
https://openrouter.ai/models

**Popular Models:**
```typescript
// OpenAI
"openai/gpt-4o"
"openai/gpt-4-turbo"
"openai/gpt-3.5-turbo"

// Anthropic
"anthropic/claude-3-opus"
"anthropic/claude-3-sonnet"
"anthropic/claude-3-haiku"

// Google
"google/gemini-pro"
"google/gemini-1.5-pro"

// Meta
"meta-llama/llama-3-70b"
"meta-llama/llama-3-8b"

// xAI
"x-ai/grok-beta"

// Mistral
"mistralai/mistral-large"
"mistralai/mistral-medium"

// Cohere
"cohere/command-r-plus"
```

---

## ✅ Example: Adding Llama 3

**Before:**
```typescript
// Only GPT and Claude models
```

**After:**
```typescript
// Add this to the AVAILABLE_MODELS array:
{
  id: "meta-llama/llama-3-70b",
  displayName: "Llama 3 70B",
  provider: "openrouter",
  logo: "/models/llama.png",
  supportsImages: false,
  supportsDebate: true,
},
```

**Result:**
- Search "llama" → model appears!
- Select → works in chat!
- No other changes needed!

---

## 🚀 That's It!

Adding models is literally:
1. Copy model ID from OpenRouter
2. Paste into `models.ts` with a name
3. Done!

The app handles everything else automatically! 🎉
