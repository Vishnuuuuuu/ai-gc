# 🐛 Debug Panel User Guide

## What is the Debug Panel?

The debug panel shows the **internal decision process** of each AI model when it decides whether to respond to a message. This transparency is critical for understanding and tuning the selective participation system.

---

## How to Access

1. **Look for the purple bug icon** in the top-right corner of the chat
2. **Click it** to toggle debug mode ON/OFF
3. **When ON:** Panel appears after each message showing all model decisions
4. **When OFF:** Panel is hidden, only participation stats show

---

## Reading the Debug Panel

### **Panel Header**

```
DEBUG: 3 RESPOND, 2 SILENT
```

- **3 RESPOND**: Number of models that decided to speak
- **2 SILENT**: Number of models that decided to stay quiet
- **Click to expand/collapse** full details

---

### **Individual Model Cards**

Each model gets a card showing its decision:

```
┌─────────────────────────────────────────────────┐
│ GPT-4                          ✓ RESPOND        │
│ 82% > 60%                                       │
│ pressure:  ████████░░  0.82                     │
│ threshold: ▕         0.60                       │
│ reason: Strong philosophical interest           │
└─────────────────────────────────────────────────┘
```

**Components:**

1. **Model Name** (top-left): Which model this is (e.g., GPT-4, Claude, Gemini)

2. **Decision Badge** (top-right):
   - 🟢 **RESPOND** (green): Model chose to speak
   - ⚫ **SILENT** (gray): Model chose to stay quiet

3. **Comparison** (82% > 60%):
   - **Left number (82%)**: Model's response pressure
   - **Symbol (>)**: Comparison operator
   - **Right number (60%)**: Threshold for this context
   - If pressure > threshold → RESPOND
   - If pressure ≤ threshold → SILENT

4. **Pressure Bar** (green/gray bar):
   - Visual representation of response pressure
   - Full bar (100%) = very strong urge to respond
   - Empty bar (0%) = zero interest

5. **Threshold Line** (yellow marker):
   - Shows where the threshold is
   - Models to the right of this line speak

6. **Reasoning** (bottom):
   - Model's internal explanation for its decision
   - Examples: "Strong disagreement", "Already well-covered", "Not my area"

---

## Interpreting Pressure Values

| Pressure | Meaning | Typical Behavior |
|----------|---------|------------------|
| 0.9-1.0  | Very strong urge | Will almost always respond |
| 0.7-0.9  | Strong interest | Likely to respond |
| 0.5-0.7  | Moderate interest | Depends on threshold |
| 0.3-0.5  | Mild interest | Likely to stay silent |
| 0.0-0.3  | No interest | Will stay silent |

---

## Understanding Thresholds

The threshold determines how much pressure is needed to speak:

| Threshold | Context | Meaning |
|-----------|---------|---------|
| 0.60 | Regular mode | Default: 60% pressure needed |
| 0.45 | Debate mode | Lower bar: 45% pressure needed |
| 0.40 | @everyone | Inclusive: 40% pressure needed |
| 0.25 | Both | Very inclusive: 25% pressure needed |

**Lower threshold = More models respond**

---

## Common Patterns to Look For

### ✅ **GOOD PATTERNS** (System Working Well)

**Pattern 1: Varied Pressures**
```
GPT-4:    0.82 → RESPOND
Claude:   0.71 → RESPOND
Gemini:   0.35 → SILENT
Grok:     0.88 → RESPOND
DeepSeek: 0.28 → SILENT
```
✅ Models have genuinely different reactions

**Pattern 2: Selective Silence on Trivial Input**
```
User: "hi"
All models: 0.1-0.3 pressure → ALL SILENT
```
✅ System correctly ignores low-value input

**Pattern 3: Technical Models Self-Select**
```
User: "Explain CAP theorem"
GPT-4:    0.85 → RESPOND (technical strength)
Claude:   0.78 → RESPOND (technical strength)
Gemini:   0.40 → SILENT ("others better suited")
Grok:     0.35 → SILENT ("not my area")
```
✅ Models recognize their strengths

---

### ❌ **BAD PATTERNS** (Needs Tuning)

**Pattern 1: All Models Same Pressure**
```
GPT-4:    0.65
Claude:   0.64
Gemini:   0.66
Grok:     0.65
```
❌ Models aren't differentiating, just noise around threshold

**Pattern 2: All Models Respond to Trivial Input**
```
User: "ok"
All models: 0.7-0.9 pressure → ALL RESPOND
```
❌ System isn't recognizing trivial messages

**Pattern 3: No Silence on Overused Questions**
```
User: "What is the meaning of life?"
All 5 models: 0.8-0.9 pressure → ALL RESPOND
```
❌ Models aren't recognizing when topic is well-covered

---

## Debugging Specific Issues

### **Issue: Too Many Models Responding**

**What to check in debug panel:**
1. Are pressures all above 0.7?
2. Is threshold too low?
3. Are reasons generic ("interesting topic")?

**Possible fixes:**
- Raise base threshold (0.6 → 0.65)
- Update prompt to emphasize uniqueness
- Check if debate mode is accidentally ON

---

### **Issue: No Models Responding**

**What to check in debug panel:**
1. Are all pressures below threshold?
2. Is threshold too high for the context?
3. Are reasons all "others will handle it"?

**Possible fixes:**
- Lower threshold slightly
- Check if models are being too conservative
- Verify prompt gives models something to react to

---

### **Issue: Same Models Always Respond**

**What to check in debug panel:**
1. Do the same model IDs always have high pressure?
2. Is there turn-by-turn variation?
3. Are different models speaking on different topics?

**Possible fixes:**
- Verify conversation context is updating correctly
- Check if prompts are too narrow
- Test with diverse topics

---

## Reasoning Field Examples

**Good reasoning (shows real evaluation):**
- ✅ "Strong disagreement with the premise"
- ✅ "Unique perspective on quantum mechanics"
- ✅ "Others already covered this well"
- ✅ "Not my area of expertise, technical models better suited"
- ✅ "Can build on Claude's point about X"

**Bad reasoning (too generic):**
- ❌ "Interesting topic"
- ❌ "Can add value"
- ❌ "Might respond"
- ❌ "Maybe relevant"

If you see bad reasoning, the prompt might need tuning.

---

## Pro Tips

1. **Screenshot failing cases:** When you see unexpected behavior, capture the debug panel
2. **Compare across turns:** Watch how the same models react to different messages
3. **Test edge cases first:** Trivial messages ("hi") and overused questions ("meaning of life")
4. **Look for pressure clustering:** If all models have ~0.5 pressure, threshold is doing all the work
5. **Disable in production:** Debug panel is for development — hide it for real users

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│                  DEBUG PANEL CHEAT SHEET            │
├─────────────────────────────────────────────────────┤
│ pressure > threshold  →  RESPOND (green)            │
│ pressure ≤ threshold  →  SILENT (gray)              │
│                                                     │
│ High pressure (0.7+)  →  Strong urge to speak      │
│ Low pressure (0.3-)   →  No interest               │
│                                                     │
│ Low threshold (0.4)   →  More models respond       │
│ High threshold (0.6)  →  Fewer models respond      │
│                                                     │
│ Varied pressures      →  ✅ System working          │
│ Same pressures        →  ❌ Not differentiating     │
└─────────────────────────────────────────────────────┘
```

---

**Remember:** If you can't explain why a model spoke or stayed silent using the debug panel, something is wrong. The panel should make every decision transparent and defensible.
