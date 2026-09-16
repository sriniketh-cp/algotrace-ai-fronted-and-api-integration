import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight,
  Loader2, Zap, AlertTriangle, Clock, Hash, ChevronRight, ChevronDown,
  Code2, Settings2, Activity, Terminal, Info, Cpu, MemoryStick, RefreshCw,
  Braces, List, Type, ToggleLeft, Binary, BookOpen, FlaskConical, Sparkles
} from 'lucide-react';

// ─── Preset Examples ─────────────────────────────────────────────────────────
const EXAMPLES = {
  "Bubble Sort": `arr = [5, 2, 8, 1, 9, 3]\nn = len(arr)\nfor i in range(n):\n    for j in range(0, n - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
  "Fibonacci": `series = []\nn = 8\na, b = 0, 1\nfor i in range(n):\n    series.append(a)\n    a, b = b, a + b\nresult = series`,
  "Binary Search": `def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\narr = [1, 3, 5, 7, 9, 11, 13]\nresult = binary_search(arr, 7)`,
  "Factorial": `def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(5)`,
  "List Comp": `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\nevens = [x for x in numbers if x % 2 == 0]\nsquares = [x ** 2 for x in evens]\ntotal = sum(squares)`,
  "Dict Ops": `inventory = {}\nitems = [("apple", 3), ("banana", 5), ("cherry", 2)]\nfor name, count in items:\n    inventory[name] = count\n\ntotal = sum(inventory.values())`,
  "Stack Sim": `stack = []\nops = ["push 1", "push 2", "push 3", "pop", "push 4"]\nfor op in ops:\n    if op.startswith("push"):\n        val = int(op.split()[1])\n        stack.append(val)\n    elif op == "pop" and stack:\n        popped = stack.pop()`,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getVarType(val) {
  if (val === null || val === undefined) return 'null';
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'boolean') return 'bool';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
  if (typeof val === 'string') return 'str';
  if (typeof val === 'object') return 'dict';
  return 'unknown';
}

const TYPE_STYLES = {
  int:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  float: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  str:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  bool:  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  array: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  dict:  'bg-pink-500/20 text-pink-300 border-pink-500/30',
  null:  'bg-slate-500/20 text-slate-400 border-slate-500/30',
  unknown:'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const EVENT_STYLES = {
  line:   { bg: 'bg-blue-500/10 border-blue-500/40',    dot: 'bg-blue-400',    text: 'text-blue-300',    label: 'LINE'   },
  call:   { bg: 'bg-emerald-500/10 border-emerald-500/40', dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'CALL'   },
  return: { bg: 'bg-purple-500/10 border-purple-500/40',  dot: 'bg-purple-400',  text: 'text-purple-300',  label: 'RETURN' },
};

const SPEEDS = [{ label: '0.5×', ms: 2000 }, { label: '1×', ms: 1000 }, { label: '2×', ms: 500 }, { label: '4×', ms: 250 }];

// ─── ValueDisplay ─────────────────────────────────────────────────────────────
function ValueDisplay({ val, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1);
  const type = getVarType(val);
  if (type === 'array') {
    return (
      <span>
        <button onClick={() => setOpen(o => !o)} className="text-orange-400 hover:text-orange-200 font-mono text-xs transition-colors">
          {open ? <ChevronDown size={10} className="inline mr-0.5" /> : <ChevronRight size={10} className="inline mr-0.5" />}
          [{val.length}]
        </button>
        {open && (
          <div className="ml-4 mt-0.5 space-y-0.5">
            {val.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-slate-600 font-mono w-4 text-right shrink-0">{i}</span>
                <ValueDisplay val={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }
  if (type === 'dict') {
    const entries = Object.entries(val);
    return (
      <span>
        <button onClick={() => setOpen(o => !o)} className="text-pink-400 hover:text-pink-200 font-mono text-xs transition-colors">
          {open ? <ChevronDown size={10} className="inline mr-0.5" /> : <ChevronRight size={10} className="inline mr-0.5" />}
          {`{${entries.length}}`}
        </button>
        {open && (
          <div className="ml-4 mt-0.5 space-y-0.5">
            {entries.map(([k, v]) => (
              <div key={k} className="flex items-start gap-2 text-xs">
                <span className="text-pink-300 font-mono shrink-0">"{k}":</span>
                <ValueDisplay val={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }
  if (type === 'str') return <span className="text-emerald-300 font-mono text-xs">"{val}"</span>;
  if (type === 'bool') return <span className="text-purple-300 font-mono text-xs">{String(val)}</span>;
  if (type === 'null') return <span className="text-slate-500 font-mono text-xs">None</span>;
  return <span className="text-amber-200 font-mono text-xs">{String(val)}</span>;
}

function TypeBadge({ val }) {
  const type = getVarType(val);
  return (
    <span className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border ${TYPE_STYLES[type] || TYPE_STYLES.unknown}`}>
      {type}
    </span>
  );
}

function VariableRow({ name, val, prevVal }) {
  const changed = prevVal !== undefined && JSON.stringify(val) !== JSON.stringify(prevVal);
  return (
    <div className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-all duration-300 ${changed ? 'bg-amber-500/10 border border-amber-500/25' : 'hover:bg-white/4'}`}>
      <div className="flex items-center gap-2 w-36 shrink-0">
        {changed && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />}
        <span className="font-mono text-sm font-semibold text-slate-200 truncate">{name}</span>
      </div>
      <TypeBadge val={val} />
      <div className="flex-1 overflow-hidden">
        <ValueDisplay val={val} depth={0} />
      </div>
    </div>
  );
}

function ArrayVisualizer({ arr, vars }) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const { i, j, mid, left, right } = vars || {};
  const MAX = 20;
  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <List size={13} className="text-orange-400" />
        <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider">Array Visualizer</span>
        <span className="ml-1 text-xs text-slate-600">arr[{arr.length}]</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {arr.slice(0, MAX).map((val, idx) => {
          const isJ = j !== undefined && (idx === j || idx === j + 1);
          const isMid = mid !== undefined && idx === mid;
          const isLeft = left !== undefined && idx === left;
          const isRight = right !== undefined && idx === right;
          const isI = i !== undefined && idx === i;
          let cls = 'bg-slate-800 border-slate-600 text-slate-200';
          let lbl = null;
          if (isMid)   { cls = 'bg-indigo-600/70 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'; lbl = 'mid'; }
          else if (isLeft)  { cls = 'bg-emerald-700/60 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'; lbl = 'L'; }
          else if (isRight) { cls = 'bg-red-700/60 border-red-400 text-white shadow-lg shadow-red-500/30'; lbl = 'R'; }
          else if (isJ) { cls = 'bg-blue-600/60 border-blue-400 text-white -translate-y-1 shadow-lg shadow-blue-500/30'; lbl = idx === j ? 'j' : 'j+1'; }
          else if (isI) { cls = 'bg-violet-700/50 border-violet-400 text-white shadow-violet-500/30'; lbl = 'i'; }
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <div className={`w-11 h-11 flex items-center justify-center text-base font-bold rounded-lg border-2 transition-all duration-300 ${cls}`}>{val}</div>
              <span className="text-[10px] font-mono text-slate-600">{idx}</span>
              {lbl && <span className="text-[10px] font-bold text-amber-400">{lbl}</span>}
            </div>
          );
        })}
        {arr.length > MAX && <span className="text-slate-500 text-xs self-end mb-1">+{arr.length - MAX}</span>}
      </div>
    </div>
  );
}

function ScalarVisualizer({ vars }) {
  if (!vars) return null;
  const scalars = Object.entries(vars).filter(([k,v]) => 
    (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') 
    && !['arr', 'i', 'j'].includes(k)
  );
  if (scalars.length === 0) return null;
  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Binary size={13} className="text-pink-400" />
        <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Variable State</span>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {scalars.map(([k, v]) => (
          <div key={k} className="flex flex-col items-center gap-1.5">
            <div className="min-w-[3rem] h-11 px-3 flex items-center justify-center text-lg font-bold rounded-lg border-2 bg-slate-800 border-pink-500/40 text-pink-100 shadow-lg shadow-pink-500/20">
              {String(v)}
            </div>
            <span className="text-[10px] font-bold text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBanner({ error, truncated, timedOut }) {
  if (!error && !truncated && !timedOut) return null;
  return (
    <div className="px-4 py-2 space-y-1.5 shrink-0">
      {timedOut && (
        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-300 text-xs">
          <Clock size={12} /><span><strong>Timed Out</strong> — Exceeded 5s wall-clock limit. Trace may be incomplete.</span>
        </div>
      )}
      {truncated && !timedOut && (
        <div className="flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 rounded-lg px-3 py-2 text-orange-300 text-xs">
          <Hash size={12} /><span><strong>Truncated</strong> — Hit the max-steps cap. Increase the limit or simplify your code.</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/40 rounded-lg px-3 py-2 text-red-300 text-xs">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" /><span><strong>Runtime Error:</strong> {error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [code, setCode] = useState(EXAMPLES['Bubble Sort']);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [maxSteps, setMaxSteps] = useState(50);
  const [complexity, setComplexity] = useState(null);
  const [complexityLoading, setComplexityLoading] = useState(false);
  const [traceError, setTraceError] = useState(null);
  const [truncated, setTruncated] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState('variables');
  const [selectedExample, setSelectedExample] = useState('Bubble Sort');
  const [hasRun, setHasRun] = useState(false);
  const [stepExplanations, setStepExplanations] = useState({});
  const [isExplainingStep, setIsExplainingStep] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const timelineRef = useRef(null);

  const activeStep = steps[currentStep] || null;
  const prevStep = steps[currentStep - 1] || null;

  // Playback
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) { setIsPlaying(false); return; }
    const t = setTimeout(() => setCurrentStep(s => s + 1), SPEEDS[speedIdx].ms);
    return () => clearTimeout(t);
  }, [isPlaying, currentStep, steps, speedIdx]);

  // Line highlighting
  useEffect(() => {
    if (!editorRef.current || !activeStep) return;
    const monaco = window.monaco;
    if (!monaco) return;
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [{
      range: new monaco.Range(activeStep.line, 1, activeStep.line, 1),
      options: { isWholeLine: true, className: 'at-active-line', glyphMarginClassName: 'at-active-glyph' },
    }]);
    editorRef.current.revealLineInCenterIfOutsideViewport(activeStep.line);
  }, [activeStep]);

  // Timeline scroll
  useEffect(() => {
    if (activeTab === 'timeline' && timelineRef.current) {
      const el = timelineRef.current.querySelector(`[data-step="${currentStep}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStep, activeTab]);

  const handleRun = async (overrideCode) => {
    const codeToRun = typeof overrideCode === 'string' ? overrideCode : code;
    if (!codeToRun.trim()) return;
    setIsLoading(true);
    setIsPlaying(false);
    setFetchError(null);
    setTraceError(null);
    setComplexity(null);
    setSteps([]);
    setCurrentStep(0);
    setHasRun(false);
    setStepExplanations({});
    try {
      const res = await fetch('http://localhost:8000/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToRun, max_steps: maxSteps }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSteps(data.steps || []);
      setTruncated(data.truncated || false);
      setTimedOut(data.timed_out || false);
      setTraceError(data.error || null);
      setCurrentStep(0);
      setHasRun(true);

      const KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (KEY) {
        setComplexityLoading(true);
        try {
          const lr = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${KEY.replace(/^"|"$/g, '')}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'openai/gpt-oss-20b',
              messages: [{ role: 'user', content: `Analyze this Python code:\n${codeToRun}\nReturn ONLY valid JSON: {"time": "O(...)", "space": "O(...)", "summary": "One sentence."}` }],
              response_format: { type: 'json_object' },
            }),
          });
          const ld = await lr.json();
          if (!lr.ok) throw new Error(ld.error?.message || `Groq HTTP ${lr.status}`);
          const content = ld.choices?.[0]?.message?.content;
          if (content) setComplexity(JSON.parse(content));
        } catch (e) { console.warn('AI failed:', e); }
        finally { setComplexityLoading(false); }
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const jumpTo = (idx) => { setCurrentStep(idx); setIsPlaying(false); };

  const handleOptimizeCode = async () => {
    if (!import.meta.env.VITE_GROQ_API_KEY) return;
    if (!code.trim()) return;
    
    setIsOptimizing(true);
    setOptimizationResult(null);
    try {
      const KEY = import.meta.env.VITE_GROQ_API_KEY.replace(/^"|"$/g, '');
      const prompt = `Analyze this Python code. Identify performance bottlenecks or algorithm inefficiencies.
Return an optimized version of the code and a short 1-2 sentence rationale explaining the optimization.
Do not wrap the code in markdown blocks, just return raw string for the code in the json.

Code:
${code}

Return ONLY valid JSON: {"optimized_code": "...", "rationale": "..."}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "API Error");
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        setOptimizationResult(parsed);
      }
    } catch (e) {
      console.warn("Optimization failed", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleExplainStep = async (stepIdx) => {
    if (!import.meta.env.VITE_GROQ_API_KEY) return;
    if (stepExplanations[stepIdx]) return; // already explained

    const curr = steps[stepIdx];
    const prev = steps[stepIdx - 1];
    
    setIsExplainingStep(true);
    try {
      const KEY = import.meta.env.VITE_GROQ_API_KEY.replace(/^"|"$/g, '');
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

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "API Error");
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        setStepExplanations(prevExps => ({...prevExps, [stepIdx]: parsed.explanation}));
      }
    } catch (e) {
      console.warn("Step explanation failed", e);
    } finally {
      setIsExplainingStep(false);
    }
  };

  const es = activeStep ? (EVENT_STYLES[activeStep.event] || EVENT_STYLES.line) : EVENT_STYLES.line;

  return (
    <div className="flex flex-col h-screen bg-[#080c18] text-slate-100 overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800/70 bg-[#0b0f1e]/95 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Activity size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent leading-none">AlgoTrace AI</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Python Execution Tracer</p>
            </div>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <BookOpen size={11} className="text-slate-600" />
            {Object.keys(EXAMPLES).map(name => (
              <button key={name} onClick={() => { setSelectedExample(name); setCode(EXAMPLES[name]); setSteps([]); setHasRun(false); setComplexity(null); setFetchError(null); setTraceError(null); }}
                className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-all duration-150 ${selectedExample === name ? 'bg-blue-600/25 border-blue-500/50 text-blue-300' : 'border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                {name}
              </button>
            ))}
            <div className="w-px h-3 bg-slate-700/60 mx-1" />
            <button onClick={() => { setSelectedExample('Custom'); setCode('# Paste your Python code here\n\n'); setSteps([]); setHasRun(false); setComplexity(null); setFetchError(null); setTraceError(null); }}
              className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-all duration-150 ${selectedExample === 'Custom' ? 'bg-indigo-600/25 border-indigo-500/50 text-indigo-300' : 'border-slate-700/50 text-indigo-400/70 hover:border-indigo-500/50 hover:text-indigo-300'}`}>
              + Custom
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5">
            <Settings2 size={11} className="text-slate-500" />
            <span className="text-xs text-slate-500">Steps:</span>
            <input type="number" value={maxSteps}
              onChange={e => setMaxSteps(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-8 bg-transparent text-xs text-slate-200 font-mono text-center outline-none" min={1} max={50} />
            <span className="text-xs text-slate-700">/50</span>
          </div>
          <button id="run-trace-btn" onClick={handleRun} disabled={isLoading || !code.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isLoading ? 'Tracing…' : 'Run Trace'}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">

        {/* Editor pane */}
        <div className="flex flex-col border-r border-slate-800/60 min-h-0" style={{ width: '55%' }}>
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-slate-800/50 shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={12} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Python Editor</span>
              {isPlaying && <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full">Read-only while playing</span>}
            </div>
            <div className="flex items-center gap-3">
              {import.meta.env.VITE_GROQ_API_KEY && (
                <button onClick={handleOptimizeCode} disabled={isOptimizing} className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/30 transition-colors cursor-pointer text-[10px] font-bold">
                  {isOptimizing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Optimize
                </button>
              )}
              <span className="text-xs text-slate-700 font-mono">{code.split('\n').length} lines</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 relative">
            <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={code}
              onChange={v => setCode(v || '')}
              onMount={editor => { editorRef.current = editor; }}
              options={{
                minimap: { enabled: false }, fontSize: 14, lineHeight: 22,
                fontFamily: "'JetBrains Mono','Fira Code',monospace", fontLigatures: true,
                scrollBeyondLastLine: false, padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'gutter', glyphMargin: true,
                readOnly: isPlaying, cursorBlinking: 'smooth',
              }} />
              
            {optimizationResult && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900 border border-blue-500/50 rounded-xl shadow-2xl p-4 z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Zap size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Optimization Ready</span>
                  </div>
                  <button onClick={() => setOptimizationResult(null)} className="text-slate-500 hover:text-slate-300">
                    <span className="text-xs">✕</span>
                  </button>
                </div>
                <p className="text-sm text-slate-300 mb-4">{optimizationResult.rationale}</p>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setCode(optimizationResult.optimized_code);
                    setOptimizationResult(null);
                    handleRun(optimizationResult.optimized_code);
                  }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    Load & Run Trace
                  </button>
                </div>
              </div>
            )}
          </div>
          {fetchError && (
            <div className="px-4 py-2.5 bg-red-950/50 border-t border-red-500/25 shrink-0">
              <div className="flex items-start gap-2 text-red-300 text-xs">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                <div><strong>Connection Error:</strong> {fetchError}<br /><span className="text-red-400/60">Start the Python backend: uvicorn main:app --reload (port 8000)</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Trace pane */}
        <div className="flex flex-col min-h-0" style={{ width: '45%' }}>

          {/* Step info bar */}
          {hasRun && activeStep ? (
            <div className="flex flex-col shrink-0">
              <div className={`px-4 py-2.5 border-b border-l-2 ${es.bg} ${es.text.replace('text-','border-')} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${es.bg} ${es.text}`}>{es.label}</span>
                  <span className="text-xs text-slate-400">Line <span className={`font-mono font-bold ${es.text}`}>{activeStep.line}</span></span>
                  <span className="text-slate-700 text-xs">•</span>
                  <span className="text-xs text-slate-400">Step <span className="font-mono font-bold text-slate-200">{currentStep + 1}</span>/<span className="font-mono text-slate-400">{steps.length}</span></span>
                </div>
                <div className={`flex items-center gap-1.5 ${es.text} text-xs`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${es.dot} animate-pulse`} />
                  {activeStep.event === 'call' ? 'Function called' : activeStep.event === 'return' ? 'Returning' : 'Executing'}
                  {import.meta.env.VITE_GROQ_API_KEY && (
                    <button onClick={() => handleExplainStep(currentStep)} disabled={isExplainingStep} className="ml-3 flex items-center gap-1 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 px-2 py-0.5 rounded border border-violet-500/30 transition-colors cursor-pointer">
                      <Sparkles size={11} /> {stepExplanations[currentStep] ? 'Explained' : 'Explain Step'}
                    </button>
                  )}
                </div>
              </div>
              {stepExplanations[currentStep] && (
                <div className="px-4 py-2 bg-violet-900/10 border-b border-violet-500/20">
                  <p className="text-xs text-violet-200 leading-relaxed"><strong className="text-violet-400">AI Tutor:</strong> {stepExplanations[currentStep]}</p>
                </div>
              )}
              {isExplainingStep && !stepExplanations[currentStep] && (
                <div className="px-4 py-2 bg-violet-900/10 border-b border-violet-500/20 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-violet-400" />
                  <span className="text-xs text-violet-300">Generating explanation...</span>
                </div>
              )}
            </div>
          ) : !hasRun ? (
            <div className="shrink-0 px-4 py-6 border-b border-slate-800/50 flex flex-col items-center justify-center gap-2 text-center">
              <FlaskConical size={30} className="text-slate-700" />
              <p className="text-sm text-slate-500 font-medium">Run your code to start tracing</p>
              <p className="text-xs text-slate-600">Select an example or write Python code, then click <strong className="text-blue-400">Run Trace</strong></p>
            </div>
          ) : null}

          {/* AI Explanation Banner */}
          {hasRun && (
            <div className="border-b border-violet-500/30 shrink-0">
              {complexityLoading ? (
                <div className="bg-violet-900/30 px-4 py-3 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-violet-400 shrink-0" />
                  <span className="text-xs text-violet-300">AI is analyzing your code…</span>
                </div>
              ) : complexity?.summary ? (
                <div className="bg-violet-900/40 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Zap size={14} className="text-violet-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1">AI Code Explanation</h3>
                      <p className="text-sm text-violet-100 leading-relaxed">{complexity.summary}</p>
                    </div>
                  </div>
                </div>
              ) : !import.meta.env.VITE_GROQ_API_KEY ? (
                <div className="bg-slate-900/40 px-4 py-2.5 flex items-center gap-2">
                  <Zap size={12} className="text-slate-600 shrink-0" />
                  <span className="text-[11px] text-slate-600">AI analysis disabled — set <code className="text-slate-500 bg-slate-800/60 px-1 rounded">VITE_GROQ_API_KEY</code> to enable complexity insights</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Status banners */}
          {hasRun && <StatusBanner error={traceError} truncated={truncated} timedOut={timedOut} />}

          {/* Tabs */}
          {hasRun && (
            <div className="flex border-b border-slate-800/60 shrink-0 bg-slate-900/20">
              {[{ id: 'variables', label: 'Variables', icon: Braces }, { id: 'timeline', label: 'Timeline', icon: Activity }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 cursor-pointer transition-all duration-150 ${activeTab === tab.id ? 'border-blue-500 text-blue-300 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-200 hover:bg-white/4'}`}>
                  <tab.icon size={12} />
                  {tab.label}
                  {tab.id === 'timeline' && <span className="ml-1 bg-slate-700/70 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{steps.length}</span>}
                </button>
              ))}
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(100,116,139,0.3) transparent' }}>

            {/* Before run: info panels */}
            {!hasRun && (
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-3"><Terminal size={13} className="text-blue-400" /><span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Sandbox Built-ins</span></div>
                  <p className="text-xs text-slate-500 mb-2">Code runs in a sandboxed environment with these safe built-ins:</p>
                  <div className="flex flex-wrap gap-1">
                    {['abs','all','any','bool','chr','dict','divmod','enumerate','filter','float','frozenset','int','isinstance','len','list','map','max','min','ord','pow','print','range','repr','reversed','round','set','sorted','str','sum','tuple','zip','type'].map(b => (
                      <code key={b} className="text-[10px] bg-slate-800/80 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700/50">{b}</code>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-2"><Info size={13} className="text-violet-400" /><span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Trace Features</span></div>
                  <ul className="text-xs text-slate-500 space-y-1.5">
                    {['Every line, call, and return is captured as a step','Variable state is snapshotted at each step','Max 50 steps prevents infinite loops','5-second wall-clock timeout','AI complexity analysis via Groq (needs VITE_GROQ_API_KEY)'].map((t, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-blue-500 shrink-0">•</span>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Variables tab */}
            {hasRun && activeTab === 'variables' && (
              <>
                {activeStep?.variables?.arr !== undefined ? (
                  <ArrayVisualizer arr={activeStep.variables.arr} vars={activeStep.variables} />
                ) : activeStep?.variables?.series !== undefined && Array.isArray(activeStep.variables.series) ? (
                  <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <List size={13} className="text-amber-400" />
                      <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Fibonacci Series</span>
                      <span className="ml-1 text-xs text-slate-600">series[{activeStep.variables.series.length}]</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {activeStep.variables.series.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-0.5">
                          <div className="w-11 h-11 flex items-center justify-center text-sm font-bold rounded-lg border-2 bg-amber-900/40 border-amber-500/60 text-amber-100 shadow-lg shadow-amber-500/20 transition-all duration-300">{val}</div>
                          <span className="text-[10px] font-mono text-slate-600">{idx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                <ScalarVisualizer vars={activeStep?.variables} />
                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/50">
                    <Braces size={12} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local Variables</span>
                    <span className="ml-auto text-xs text-slate-600 font-mono">{Object.keys(activeStep?.variables || {}).length} vars</span>
                  </div>
                  {activeStep && Object.keys(activeStep.variables || {}).length > 0 ? (
                    <div className="divide-y divide-slate-800/30">
                      {Object.entries(activeStep.variables).map(([n, v]) => (
                        <VariableRow key={n} name={n} val={v} prevVal={prevStep?.variables?.[n]} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 text-center py-6">No local variables in scope</p>
                  )}
                </div>

                {/* Complexity */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu size={13} className="text-blue-400" />
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Time &amp; Space Complexity</span>
                    {complexityLoading && <Loader2 size={11} className="animate-spin text-blue-400 ml-1" />}
                  </div>
                  {complexityLoading ? (
                    <div className="flex gap-2">
                      {['Time', 'Space'].map(label => (
                        <div key={label} className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/30 animate-pulse">
                          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{label}</div>
                          <div className="h-5 w-16 bg-slate-700/60 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : complexity ? (
                    <div className="flex gap-2">
                      <div className="flex-1 bg-slate-800/70 rounded-lg px-3 py-2 border border-slate-700/40">
                        <div className="flex items-center gap-1 mb-1"><Cpu size={10} className="text-blue-400" /><span className="text-[10px] text-slate-500 uppercase tracking-wider">Time</span></div>
                        <span className="font-mono text-sm font-bold text-blue-300">{complexity.time}</span>
                      </div>
                      <div className="flex-1 bg-slate-800/70 rounded-lg px-3 py-2 border border-slate-700/40">
                        <div className="flex items-center gap-1 mb-1"><MemoryStick size={10} className="text-emerald-400" /><span className="text-[10px] text-slate-500 uppercase tracking-wider">Space</span></div>
                        <span className="font-mono text-sm font-bold text-emerald-300">{complexity.space}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 text-center py-2">
                      {import.meta.env.VITE_GROQ_API_KEY ? 'Analysis unavailable' : 'Set VITE_GROQ_API_KEY to enable AI complexity analysis'}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Timeline tab */}
            {hasRun && activeTab === 'timeline' && (
              <div ref={timelineRef} className="space-y-0.5">
                {steps.map((step, idx) => {
                  const se = EVENT_STYLES[step.event] || EVENT_STYLES.line;
                  const isCur = idx === currentStep;
                  const varPreview = Object.entries(step.variables || {}).slice(0, 3).map(([k, v]) => `${k}=${Array.isArray(v) ? `[${v.length}]` : typeof v === 'object' && v ? '{…}' : v}`).join(', ');
                  return (
                    <button key={idx} data-step={idx} onClick={() => jumpTo(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left border cursor-pointer transition-all duration-100 ${isCur ? `${se.bg} border-opacity-50` : 'border-transparent hover:bg-white/4'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${se.dot} ${isCur ? 'animate-pulse' : 'opacity-30'}`} />
                      <span className={`text-[10px] font-bold font-mono w-12 shrink-0 ${isCur ? se.text : 'text-slate-700'}`}>{se.label}</span>
                      <span className={`text-xs font-mono shrink-0 ${isCur ? 'text-slate-200' : 'text-slate-600'}`}>L{step.line}</span>
                      <span className={`text-[10px] font-mono shrink-0 ml-auto ${isCur ? 'text-slate-400' : 'text-slate-700'}`}>#{step.step}</span>
                      <span className="text-[10px] text-slate-700 truncate max-w-[120px]">{varPreview}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Playback controls */}
          {hasRun && steps.length > 0 && (
            <div className="shrink-0 border-t border-slate-800/60 bg-[#0b0f1e]/70 px-4 py-3">
              {/* Scrubber */}
              <div className="mb-2.5">
                <input type="range" min={0} max={steps.length - 1} value={currentStep}
                  onChange={e => jumpTo(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-slate-700/80 cursor-pointer"
                  style={{ accentColor: '#3b82f6' }} />
                <div className="flex justify-between text-[10px] font-mono text-slate-700 mt-1">
                  <span>1</span><span className="text-slate-400">{currentStep + 1} / {steps.length}</span><span>{steps.length}</span>
                </div>
              </div>
              {/* Controls */}
              <div className="flex items-center justify-between">
                {/* Speed */}
                <div className="flex gap-1">
                  {SPEEDS.map((s, i) => (
                    <button key={i} onClick={() => setSpeedIdx(i)} className={`text-[10px] font-mono px-2 py-1 rounded border cursor-pointer transition-all ${speedIdx === i ? 'bg-blue-600/25 border-blue-500/50 text-blue-300' : 'border-slate-700/50 text-slate-600 hover:text-slate-300'}`}>{s.label}</button>
                  ))}
                </div>
                {/* Nav */}
                <div className="flex items-center gap-1.5">
                  <button id="first-btn" onClick={() => jumpTo(0)} disabled={currentStep === 0} title="First" className="text-slate-600 hover:text-slate-300 disabled:opacity-25 transition-colors cursor-pointer"><ChevronsLeft size={17} /></button>
                  <button id="prev-btn" onClick={() => jumpTo(Math.max(0, currentStep - 1))} disabled={currentStep === 0} title="Previous" className="text-slate-500 hover:text-slate-200 disabled:opacity-25 transition-colors cursor-pointer"><SkipBack size={19} /></button>
                  <button id="play-btn" onClick={() => setIsPlaying(p => !p)}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all cursor-pointer">
                    {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
                  </button>
                  <button id="next-btn" onClick={() => jumpTo(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1} title="Next" className="text-slate-500 hover:text-slate-200 disabled:opacity-25 transition-colors cursor-pointer"><SkipForward size={19} /></button>
                  <button id="last-btn" onClick={() => jumpTo(steps.length - 1)} disabled={currentStep === steps.length - 1} title="Last" className="text-slate-600 hover:text-slate-300 disabled:opacity-25 transition-colors cursor-pointer"><ChevronsRight size={17} /></button>
                </div>
                <button id="reset-trace-btn" onClick={() => { setSteps([]); setHasRun(false); setCurrentStep(0); setIsPlaying(false); if (editorRef.current) decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []); }}
                  className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-300 border border-slate-700/40 hover:border-slate-600 px-2 py-1 rounded cursor-pointer transition-all">
                  <RefreshCw size={10} />Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for Monaco + scrollbar */}
      <style>{`
        .at-active-line { background: rgba(99,102,241,0.12) !important; border-left: 2px solid rgb(99,102,241) !important; }
        .at-active-glyph { background: radial-gradient(circle, rgb(99,102,241) 3px, transparent 3px) center no-repeat; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; background:#3b82f6; cursor:pointer; box-shadow:0 0 6px rgba(59,130,246,0.4); }
      `}</style>
    </div>
  );
}
