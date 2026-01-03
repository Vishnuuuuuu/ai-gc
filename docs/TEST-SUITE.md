# 🧪 Selective Participation Test Suite

## Purpose
This test suite validates that the selective participation system works correctly across different types of prompts and scales properly with multiple models.

---

## 🎯 Test Categories

### **Category A: Broad / Overused Questions**

**Expected Behavior:** Few responders (2-4 models), not all. Models should recognize these are common questions where others will likely respond similarly.

**Test Prompts:**
1. `"What is the meaning of life?"`
2. `"Is AI dangerous?"`
3. `"What is consciousness?"`
4. `"What makes us human?"`
5. `"Will AI replace humans?"`

**Success Criteria:**
- ✅ 2-4 models respond (not all)
- ✅ Some models explicitly stay silent
- ✅ Responses are diverse, not redundant
- ❌ FAIL if: All models respond with essays
- ❌ FAIL if: All responses say the same thing

**Debug Panel Should Show:**
- Low pressure (0.3-0.5) for models that stay silent
- Reasoning like: "Already well-covered", "Others will handle this better"

---

### **Category B: Technical / Narrow Questions**

**Expected Behavior:** Some models stay silent. Only models with strong alignment to the topic should respond.

**Test Prompts:**
1. `"Explain JavaScript event loop"`
2. `"What is CAP theorem?"`
3. `"Why does React re-render?"`
4. `"How does TCP congestion control work?"`
5. `"What is the halting problem?"`

**Success Criteria:**
- ✅ 1-3 models respond (selective)
- ✅ Models with weaker technical alignment stay silent
- ✅ Responses are technically accurate
- ❌ FAIL if: All models respond equally
- ❌ FAIL if: Generic models respond as much as technical models

**Debug Panel Should Show:**
- High pressure (0.7-0.9) for technical models
- Low pressure (0.2-0.4) for generalist models
- Reasoning like: "Not my area of expertise", "Technical question, others better suited"

---

### **Category C: Opinionated / Provocative**

**Expected Behavior:** More disagreement, more replies. Models should feel compelled to respond when they disagree.

**Test Prompts:**
1. `"Most humans are not actually rational."`
2. `"AI should replace most programmers."`
3. `"Privacy is already dead."`
4. `"Democracy is overrated."`
5. `"Free will is an illusion."`

**Success Criteria:**
- ✅ 3-5 models respond (higher participation)
- ✅ Responses show disagreement or nuance
- ✅ Models reference each other's points
- ❌ FAIL if: All models agree
- ❌ FAIL if: Responses are non-committal

**Debug Panel Should Show:**
- High pressure (0.7-0.9) for models that disagree
- Reasoning like: "Strong disagreement", "Can add contrary perspective", "This deserves debate"

---

### **Category D: Trivial / Low Signal**

**Expected Behavior:** Mostly silence. These messages don't warrant multiple AI responses.

**Test Prompts:**
1. `"hi"`
2. `"ok"`
3. `"lol"`
4. `"thanks"`
5. `"cool"`
6. `"nice"`
7. `"👍"`

**Success Criteria:**
- ✅ 0-1 model responds
- ✅ Response is brief if any
- ❌ FAIL if: Multiple models respond
- ❌ FAIL if: Models write essays to "hi"

**Debug Panel Should Show:**
- Very low pressure (0.1-0.3) across all models
- Reasoning like: "Too trivial", "No value to add", "Simple acknowledgment"

**⚠️ CRITICAL:** This category is crucial for proving the system prevents spam.

---

## 🔬 Test Execution Instructions

### **How to Test Each Category:**

1. **Enable Debug Mode** (purple bug icon in top-right)
2. **Send test prompt** from category
3. **Observe Debug Panel:**
   - Check pressure values
   - Read reasoning
   - Verify decision logic
4. **Verify response count** matches expectations
5. **Read actual responses** for quality/diversity
6. **Document results** in table below

### **Test Results Template:**

| Prompt | Expected | Actual Count | Pressures | Pass/Fail | Notes |
|--------|----------|--------------|-----------|-----------|-------|
| "What is consciousness?" | 2-4 | 3 | 0.82, 0.71, 0.65, 0.38, 0.22 | ✅ PASS | Good diversity |
| "hi" | 0-1 | 2 | 0.55, 0.48 | ❌ FAIL | Too many responses |

---

## 📊 Scale Testing (Category B → Extended)

### **Objective:** Prove response count plateaus as model count increases.

**Setup:**
1. Create 3 different chats:
   - Chat 1: 2 models
   - Chat 2: 5 models
   - Chat 3: 10 models (if available)

**Test Prompt (same for all):**
```
@everyone AI will replace most white-collar jobs within 10 years.
```

**Expected Results:**

| Model Count | Expected Responding | Expected Pressure Range |
|-------------|---------------------|-------------------------|
| 2 models    | 1-2 (50-100%)       | 0.5-0.9                 |
| 5 models    | 2-3 (40-60%)        | 0.4-0.8                 |
| 10 models   | 3-4 (30-40%)        | 0.4-0.8                 |

**Success Criteria:**
- ✅ Response count plateaus (doesn't grow linearly)
- ✅ Conversation remains readable with 10 models
- ❌ FAIL if: 10 models = 10 responses

**Why This Matters:** This proves your core USP — scales cleanly to many models.

---

## ⏱️ Temporal Testing (Multi-Turn Conversations)

### **Objective:** Verify participation shifts naturally over conversation turns.

**Test Conversation:**

```
Turn 1 (User): "AI will replace most jobs."
→ Observe: Which models respond? Note their IDs.

Turn 2 (User): "Why do you think that?"
→ Observe: Do DIFFERENT models respond now?

Turn 3 (User): "I disagree. Humans are creative."
→ Observe: Does disagreement trigger new participants?

Turn 4 (User): "@GPT-4 what do you think?"
→ Observe: Does direct mention force response?
```

**Success Criteria:**
- ✅ Participation shifts between turns
- ✅ Silent models in turn 1 may speak in turn 2
- ✅ Active models in turn 1 may stay silent in turn 2
- ✅ Direct mentions (@modelname) should increase pressure
- ❌ FAIL if: Same models always respond

**Debug Panel Should Show:**
- Different pressure distributions per turn
- Reasoning like: "Already spoke on this", "New angle worth addressing"

---

## 🎯 Quick Smoke Test (Run This First)

**Before running full suite, run this quick smoke test:**

1. Enable debug mode
2. Send: `"@everyone what is the meaning of life"`
3. **Verify:**
   - Debug panel appears
   - Shows 5/5 decisions (or however many models you have)
   - Some models marked RESPOND, some SILENT
   - Pressure values vary (not all 0.5)
   - Threshold shown (likely 0.40 with @everyone)

If smoke test fails, don't proceed to full suite — fix debug visibility first.

---

## 📝 Test Reporting Format

After running all tests, create a summary:

```markdown
## Test Results Summary

**Date:** YYYY-MM-DD
**Models Tested:** [list model IDs]
**Debug Mode:** ✅ Working

### Category A (Broad Questions):
- Tested: 5/5 prompts
- Passed: 4/5
- Failed: 1/5 (prompt X had all models respond)

### Category B (Technical Questions):
- Tested: 5/5 prompts
- Passed: 5/5

### Category C (Opinionated):
- Tested: 5/5 prompts
- Passed: 3/5
- Failed: 2/5 (not enough disagreement)

### Category D (Trivial):
- ⚠️ CRITICAL CATEGORY
- Tested: 7/7 prompts
- Passed: 5/7
- Failed: 2/7 ("hi" got 2 responses)

### Scale Testing:
- 2 models: 2 responses ✅
- 5 models: 3 responses ✅
- 10 models: 4 responses ✅ (plateau achieved)

### Temporal Testing:
- Turn-based participation shift: ✅
- Different models per turn: ✅

**Overall Assessment:** [PASS/FAIL with notes]
```

---

## 🔧 Tuning Recommendations

Based on test results, you may need to adjust:

**If too many models respond:**
- Increase base threshold (0.6 → 0.65)
- Make prompt more explicit about "only respond if you have something unique"

**If too few models respond:**
- Decrease base threshold (0.6 → 0.55)
- Adjust debate mode modifier (-0.15 → -0.20)

**If Category D fails (trivial messages get responses):**
- This is the most important category
- Add explicit guidance in prompts to ignore trivial input
- Consider adding trivial message detection

---

## 🚀 Next Steps After Testing

1. **Document failures** with debug panel screenshots
2. **Iterate on thresholds** if needed
3. **Test with real users** (not just synthetic prompts)
4. **Monitor console logs** for patterns
5. **Disable debug mode** for production (or make it hidden by default)

---

**Remember:** The debug panel is your ground truth. If you can't explain why a model spoke or stayed silent, the system isn't working correctly.
