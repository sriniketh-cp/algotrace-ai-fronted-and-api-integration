// ─── AI Service for AlgoTrace ──────────────────────────────────────────────────
// Centralized API integration with Groq (openai/gpt-oss-20b)

const MODEL_NAME = 'openai/gpt-oss-20b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Get cleaned Groq API Key from environment
 */
export function getApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) return null;
  return key.replace(/^["']|["']$/g, '').trim();
}

/**
 * Common fetch helper for Groq chat completions
 */
async function callGroq({ messages, jsonFormat = false, temperature = 0.3 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Groq API Key is not configured. Please set VITE_GROQ_API_KEY in your .env file.');
  }

  const payload = {
    model: MODEL_NAME,
    messages,
    temperature,
  };

  if (jsonFormat) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Groq API error (HTTP ${response.status})`);
  }

  return data.choices?.[0]?.message?.content || '';
}

/**
 * Feature 3: AI Edge Case & Stress-Test Generator
 * Inspects algorithm and generates 4 tricky test cases tailored to it.
 */
export async function generateEdgeCases(code) {
  const prompt = `You are an expert Computer Science professor and competitive programming judge.
Inspect this Python algorithm code:
\`\`\`python
${code}
\`\`\`

Generate exactly 4 realistic, tricky stress-test and edge-case inputs specifically designed to test, stress, or reveal boundary bugs in this algorithm:
1. "Worst-Case Scenario" (e.g. reverse sorted array, worst-case recursion, maximum iterations)
2. "Best-Case / Invariance" (e.g. already sorted, target found immediately, minimal steps)
3. "Boundary Condition" (e.g. empty list [], single element [42], 0, or minimal valid input)
4. "Duplicates & Edge Values" (e.g. all identical elements [5, 5, 5, 5], negative values, or alternating patterns)

For each test case provide:
- "id": Unique slug like "worst_case", "best_case", "boundary_empty", "duplicates"
- "name": Concise name (e.g. "Reverse Sorted Array", "Single Element Array")
- "category": One of: "Worst Case", "Best Case", "Boundary Condition", "Duplicates & Edge Values"
- "description": 1-2 sentences explaining what this stresses in the algorithm.
- "rationale": Why students' implementations frequently fail or behave unusually here (e.g. "Tests if an early termination flag stops the loop in O(N)").
- "modified_code": The COMPLETE runnable Python code with the input data replaced. Make sure the code runs standalone and without syntax errors.

Return ONLY valid JSON in this exact structure:
{
  "test_cases": [
    {
      "id": "worst_case",
      "name": "Reverse Sorted Array",
      "category": "Worst Case",
      "description": "...",
      "rationale": "...",
      "modified_code": "..."
    }
  ]
}`;

  const content = await callGroq({
    messages: [
      { role: 'system', content: 'You are a Computer Science grading assistant that returns strictly valid JSON without extra text.' },
      { role: 'user', content: prompt }
    ],
    jsonFormat: true,
    temperature: 0.2
  });

  const parsed = JSON.parse(content);
  return parsed.test_cases || [];
}

/**
 * Feature 4: Interactive "AlgoTutor" Copilot
 * Context-aware AI tutor that knows the full execution trace telemetry.
 */
export async function askAlgoTutor({
  code,
  steps = [],
  currentStep = 0,
  activeStep = null,
  question,
  history = [],
  complexity = null,
  traceError = null
}) {
  // Build execution telemetry context
  const totalSteps = steps.length;
  const currentStepInfo = activeStep
    ? `Step #${currentStep + 1} of ${totalSteps} (Line ${activeStep.line}, Event: ${activeStep.event}). Variables: ${JSON.stringify(activeStep.variables || {})}`
    : `No active step selected (Total steps: ${totalSteps})`;

  const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;
  const finalState = lastStep ? JSON.stringify(lastStep.variables || {}) : 'None';

  const systemContext = `You are AlgoTutor, an elite, patient, and insightful Computer Science professor & AlgoTrace Copilot.
You are assisting a student analyzing the step-by-step execution of their Python code.

CURRENT EXECUTION TELEMETRY:
- Full Code:
\`\`\`python
${code}
\`\`\`
- Total Execution Steps: ${totalSteps}
- Current Active Step: ${currentStepInfo}
- Final Step State: ${finalState}
${complexity ? `- Known Complexity: Time ${complexity.time}, Space ${complexity.space} (${complexity.summary})` : ''}
${traceError ? `- Trace Runtime Error: ${traceError}` : ''}

INSTRUCTIONS:
- Answer the student's question directly, accurately, and educationally using the execution telemetry.
- When referring to variables or lines, cite them explicitly (e.g., "At Step 4 (Line 5), \`arr\` swapped [2, 5]").
- If asked about time/space complexity, loops, or alternative data structures, provide clear algorithmic reasoning.
- Keep answers concise, clear, and engaging (2-4 paragraphs or formatted bullet points).
- You may use markdown formatting, bold keywords, and short code snippets.`;

  // Format previous conversation for multi-turn chat
  const chatMessages = [
    { role: 'system', content: systemContext },
    ...history.slice(-8).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    })),
    { role: 'user', content: question }
  ];

  const content = await callGroq({
    messages: chatMessages,
    jsonFormat: false,
    temperature: 0.4
  });

  return content;
}

/**
 * AI Complexity & Space Analysis
 */
export async function analyzeComplexity(code) {
  const prompt = `Analyze this Python code:
${code}
Return ONLY valid JSON: {"time": "O(...)", "space": "O(...)", "summary": "One sentence explanation."}`;

  const content = await callGroq({
    messages: [{ role: 'user', content: prompt }],
    jsonFormat: true,
    temperature: 0.2
  });

  return JSON.parse(content);
}

/**
 * AI Code Optimizer
 * Produces two optimizations:
 * 1. Interview & Exam Mode (Strictly ZERO built-in functions like sorted(), sum(), max(), min(), set(), etc.)
 * 2. Standard Pythonic Mode
 */
export async function optimizeCode(code) {
  const prompt = `You are a Senior Technical Interviewer at Google and a University Computer Science Professor.
Analyze this Python code for algorithmic efficiency (Time & Space Complexity bottlenecks):
\`\`\`python
${code}
\`\`\`

Provide TWO distinct optimizations:

1. "interview_optimization":
- STRICT PROFESSOR / INTERVIEWER RULE: In technical interviews and exams, students are FORBIDDEN from using high-level Python built-in functions!
- DO NOT USE: sorted(), .sort(), sum(), max(), min(), set(), reverse(), reversed(), .index(), .count(), map(), filter(), reduce(), or any library functions.
- YOU MUST USE: Pure fundamental Computer Science logic — manual loops (for, while), two pointers, sliding window, in-place swaps, Kadane's dynamic loops, binary search, or manual counter arrays/hash updates.
- ZERO IMPORTS: Do NOT include ANY 'import' statements (no import sys, math, collections, etc.). The execution sandbox blocks all imports.
- Must be COMPLETE, RUNNABLE Python code with sample inputs ready to execute.

2. "pythonic_optimization":
- Standard idiomatic Python optimization.
- ZERO IMPORTS: Do NOT include ANY 'import' statements.
- Must be COMPLETE, RUNNABLE Python code with sample inputs.

Return ONLY valid JSON matching this exact structure:
{
  "interview_optimization": {
    "technique": "Name of algorithm/technique (e.g. Two-Pointer In-Place Traversal)",
    "time_complexity": "O(...)",
    "space_complexity": "O(...)",
    "time_reduction": "e.g. O(N²) → O(N)",
    "space_reduction": "e.g. O(N) → O(1) in-place",
    "rationale": "1-2 sentences explaining how the manual algorithm reduces complexity.",
    "interviewer_focus": "Why professors and interviewers test this from-scratch method (e.g. tests loop invariants, boundary checks, zero extra allocation).",
    "code": "COMPLETE RUNNABLE Python code (NO imports, NO sorted/sum/max/min/set/reverse)"
  },
  "pythonic_optimization": {
    "technique": "e.g. Pythonic Dictionary / Comprehension",
    "time_complexity": "O(...)",
    "space_complexity": "O(...)",
    "time_reduction": "e.g. O(N²) → O(N)",
    "space_reduction": "e.g. O(N)",
    "rationale": "1-2 sentences explaining the Pythonic solution.",
    "code": "COMPLETE RUNNABLE Python code (NO imports)"
  }
}`;

  const content = await callGroq({
    messages: [
      { role: 'system', content: 'You are an expert algorithm judge and computer science professor that outputs strictly valid JSON.' },
      { role: 'user', content: prompt }
    ],
    jsonFormat: true,
    temperature: 0.2
  });

  const parsed = JSON.parse(content);
  // Ensure backward compatibility for any component reading .optimized_code / .rationale
  if (parsed.interview_optimization) {
    parsed.optimized_code = parsed.interview_optimization.code;
    parsed.rationale = parsed.interview_optimization.rationale;
  }
  return parsed;
}

/**
 * AI Step Explainer
 */
export async function explainStep(code, curr, prev) {
  const prevVars = prev ? JSON.stringify(prev.variables) : "None (start of execution)";
  const currVars = JSON.stringify(curr.variables);

  const prompt = `Analyze this exact execution step in a Python program.
Code:
${code}

Event: ${curr.event} at Line ${curr.line}
Previous variables: ${prevVars}
Current variables: ${currVars}

Explain what just happened in 1-2 concise, educational sentences focusing on variable state changes.
Return ONLY valid JSON: {"explanation": "..."}`;

  const content = await callGroq({
    messages: [{ role: 'user', content: prompt }],
    jsonFormat: true,
    temperature: 0.2
  });

  return JSON.parse(content);
}

/**
 * AI Crash Analyzer
 */
export async function analyzeCrash(code, traceError) {
  const prompt = `A Python program encountered a runtime error.
Error: ${traceError}
Code:
${code}

Explain why this error happened in 1-2 concise sentences. 
Provide a fixed version of the code that resolves the error.
Do not wrap the code in markdown blocks, just return raw string for the code in the json.

Return ONLY valid JSON: {"explanation": "...", "fixed_code": "..."}`;

  const content = await callGroq({
    messages: [{ role: 'user', content: prompt }],
    jsonFormat: true,
    temperature: 0.2
  });

  return JSON.parse(content);
}
