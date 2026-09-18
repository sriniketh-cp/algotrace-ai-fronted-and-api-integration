import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight,
  Loader2, Zap, AlertTriangle, Code2, Settings2, Activity, Terminal,
  Cpu, MemoryStick, RefreshCw, Braces, BookOpen, Sparkles,
  Target, Bot, Rocket,GraduationCap
} from 'lucide-react';

import { EXAMPLES, TYPE_STYLES, EVENT_STYLES, SPEEDS } from './utils/constants';
import { ArrayVisualizer, ScalarVisualizer, VariableRow, ValueDisplay, TypeBadge } from './components/Visualizers';
import { StatusBanner } from './components/StatusBanner';
import { EdgeCaseModal } from './components/EdgeCaseModal';
import { AlgoTutorDrawer } from './components/AlgoTutorDrawer';
import { OptimizerModal } from './components/OptimizerModal';
import {
  generateEdgeCases, askAlgoTutor, analyzeComplexity,
  optimizeCode, explainStep, analyzeCrash, getApiKey
} from './services/aiService';

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
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isAnalyzingError, setIsAnalyzingError] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState(null);

  // AI Feature 3: Edge Case & Stress-Test Generator State
  const [isEdgeCaseOpen, setIsEdgeCaseOpen] = useState(false);
  const [edgeCases, setEdgeCases] = useState([]);
  const [isGeneratingEdgeCases, setIsGeneratingEdgeCases] = useState(false);

  // AI Feature 4: Interactive AlgoTutor Copilot State
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorMessages, setTutorMessages] = useState([]);
  const [isTutorTyping, setIsTutorTyping] = useState(false);

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
    setErrorAnalysis(null);
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

      if (getApiKey()) {
        setComplexityLoading(true);
        try {
          const comp = await analyzeComplexity(codeToRun);
          setComplexity(comp);
        } catch (e) {
          console.warn('AI complexity analysis failed:', e);
        } finally {
          setComplexityLoading(false);
        }
      }
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const jumpTo = (idx) => { setCurrentStep(idx); setIsPlaying(false); };

  const handleOptimizeCode = async (force = false) => {
    if (!getApiKey() || !code.trim()) return;
    setIsOptimizerOpen(true);
    if (optimizationResult && !force) return;

    setIsOptimizing(true);
    try {
      const res = await optimizeCode(code);
      setOptimizationResult(res);
    } catch (e) {
      console.warn("Optimization failed", e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimizedCode = (optimizedCode) => {
    setCode(optimizedCode);
    setOptimizationResult(null);
    setIsOptimizerOpen(false);
    handleRun(optimizedCode);
  };

  const handleExplainStep = async (stepIdx) => {
    if (!getApiKey()) return;
    if (stepExplanations[stepIdx]) return;

    const curr = steps[stepIdx];
    const prev = steps[stepIdx - 1];

    setIsExplainingStep(true);
    try {
      const res = await explainStep(code, curr, prev);
      if (res?.explanation) {
        setStepExplanations(prevExps => ({ ...prevExps, [stepIdx]: res.explanation }));
      }
    } catch (e) {
      console.warn("Step explanation failed", e);
    } finally {
      setIsExplainingStep(false);
    }
  };

  const handleAnalyzeError = async () => {
    if (!getApiKey()) return;
    if (!traceError || !code.trim()) return;

    setIsAnalyzingError(true);
    setErrorAnalysis(null);
    try {
      const res = await analyzeCrash(code, traceError);
      setErrorAnalysis(res);
    } catch (e) {
      console.warn("Error analysis failed", e);
    } finally {
      setIsAnalyzingError(false);
    }
  };

  const handleGenerateEdgeCases = async () => {
    if (!code.trim() || !getApiKey()) return;
    setIsGeneratingEdgeCases(true);
    try {
      const cases = await generateEdgeCases(code);
      setEdgeCases(cases);
    } catch (err) {
      console.warn("Edge case generation failed", err);
    } finally {
      setIsGeneratingEdgeCases(false);
    }
  };

  const handleApplyEdgeCase = (modifiedCode) => {
    setCode(modifiedCode);
    setIsEdgeCaseOpen(false);
    handleRun(modifiedCode);
  };

  const handleSendTutorMessage = async (question) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: question, timestamp: time };
    const updatedHistory = [...tutorMessages, userMsg];
    setTutorMessages(updatedHistory);
    setIsTutorTyping(true);

    try {
      const answer = await askAlgoTutor({
        code, steps, currentStep, activeStep, question,
        history: updatedHistory, complexity, traceError
      });
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTutorMessages(prev => [...prev, { sender: 'assistant', text: answer, timestamp: botTime }]);
    } catch (err) {
      console.warn("AlgoTutor failed", err);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTutorMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ AlgoTutor could not respond: ${err.message || 'Check your Groq API key configuration.'}`,
          timestamp: botTime
        }
      ]);
    } finally {
      setIsTutorTyping(false);
    }
  };

  const handleClearTutor = () => setTutorMessages([]);

  const es = activeStep ? (EVENT_STYLES[activeStep.event] || EVENT_STYLES.line) : EVENT_STYLES.line;
  const progress = steps.length > 0 ? Math.round(((currentStep + 1) / steps.length) * 100) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)', fontFamily: 'var(--font-sans)', color: '#e2e8f0' }}>

      {/* ── Top Navigation Bar ─────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-5 py-0 border-b z-20"
        style={{ borderColor: 'var(--border-subtle)', background: 'rgba(12,16,34,0.97)', backdropFilter: 'blur(16px)', height: '52px' }}>

        {/* Left: Brand + Examples */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
              <Activity size={15} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold leading-none gradient-text tracking-tight">AlgoTrace AI</h1>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>Python Execution Tracer</p>
            </div>
          </div>

          <div className="h-5 w-px mx-0.5" style={{ background: 'var(--border-muted)' }} />

          {/* Example pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <BookOpen size={11} style={{ color: 'rgba(148,163,184,0.35)', flexShrink: 0 }} />
            {Object.keys(EXAMPLES).map(name => (
              <button key={name} onClick={() => {
                setSelectedExample(name); setCode(EXAMPLES[name]);
                setSteps([]); setHasRun(false); setComplexity(null);
                setFetchError(null); setTraceError(null); setEdgeCases([]);
              }}
                className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer transition-all duration-150 whitespace-nowrap"
                style={selectedExample === name ? {
                  background: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc'
                } : {
                  background: 'transparent', borderColor: 'var(--border-subtle)', color: 'rgba(148,163,184,0.6)'
                }}>
                {name}
              </button>
            ))}
            <div className="w-px h-3.5 mx-0.5" style={{ background: 'var(--border-muted)' }} />
            <button onClick={() => {
              setSelectedExample('Custom'); setCode('# Paste your Python code here\n\n');
              setSteps([]); setHasRun(false); setComplexity(null);
              setFetchError(null); setTraceError(null); setEdgeCases([]);
            }}
              className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer transition-all duration-150 whitespace-nowrap"
              style={selectedExample === 'Custom' ? {
                background: 'rgba(139,92,246,0.2)', borderColor: 'rgba(139,92,246,0.5)', color: '#c4b5fd'
              } : {
                background: 'transparent', borderColor: 'var(--border-subtle)', color: 'rgba(139,92,246,0.55)'
              }}>
              + Custom
            </button>
          </div>
        </div>

        {/* Right: AI Tools + Run */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {getApiKey() && (
            <>
              {/* Optimize */}
              <button onClick={() => handleOptimizeCode()}
                title="AI Code Optimizer — Interview & Exam Mode (Zero Built-ins)"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-150 border"
                style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#93c5fd' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}>
                <Zap size={12} style={{ color: '#60a5fa' }} />
                <span>Optimize</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  No Built-ins
                </span>
              </button>

              {/* Stress Tests */}
              <button onClick={() => { setIsEdgeCaseOpen(true); if (edgeCases.length === 0) handleGenerateEdgeCases(); }}
                title="AI Edge Case & Stress-Test Generator"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-150 border"
                style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.28)', color: '#fcd34d' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.16)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.28)'; }}>
                <Target size={12} style={{ color: '#fbbf24' }} />
                <span>Stress Tests</span>
              </button>

              {/* AlgoTutor */}
              <button onClick={() => setIsTutorOpen(p => !p)}
                title="AlgoTutor Copilot — Ask anything about this execution"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-150 border"
                style={isTutorOpen ? {
                  background: 'rgba(139,92,246,0.85)', borderColor: 'rgba(139,92,246,0.7)', color: '#fff',
                  boxShadow: '0 0 12px rgba(139,92,246,0.35)'
                } : {
                  background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.28)', color: '#c4b5fd'
                }}
                onMouseEnter={e => { if (!isTutorOpen) { e.currentTarget.style.background = 'rgba(139,92,246,0.18)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; } }}
                onMouseLeave={e => { if (!isTutorOpen) { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.28)'; } }}>
                <Bot size={12} style={{ color: isTutorOpen ? '#fff' : '#a78bfa' }} />
                <span>AlgoTutor</span>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isTutorOpen ? '#fff' : '#a78bfa' }} />
              </button>
            </>
          )}

          {/* Max Steps */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px]"
            style={{ background: 'rgba(15,23,42,0.7)', borderColor: 'var(--border-muted)', color: 'rgba(148,163,184,0.6)' }}>
            <Settings2 size={11} />
            <span>Steps:</span>
            <input type="number" value={maxSteps}
              onChange={e => setMaxSteps(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-7 bg-transparent text-center outline-none font-mono font-semibold"
              style={{ color: '#e2e8f0' }} min={1} max={50} />
            <span style={{ color: 'rgba(148,163,184,0.35)' }}>/50</span>
          </div>

          {/* Run Trace */}
          <button id="run-trace-btn" onClick={handleRun} disabled={isLoading || !code.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.3)'; }}>
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isLoading ? 'Tracing…' : 'Run Trace'}
          </button>
        </div>
      </header>

      {/* ── Main Two-Pane Layout ───────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: Editor Pane ───────────────────────────────────────────── */}
        <div className="flex flex-col min-h-0 border-r" style={{ width: '55%', borderColor: 'var(--border-subtle)' }}>

          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b"
            style={{ background: 'rgba(12,16,34,0.6)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', opacity: 0.6 }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b', opacity: 0.6 }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e', opacity: 0.6 }} />
              </div>
              <div className="w-px h-3.5 mx-1" style={{ background: 'var(--border-muted)' }} />
              <Code2 size={12} style={{ color: 'rgba(148,163,184,0.4)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'rgba(148,163,184,0.55)' }}>
                main.py
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(148,163,184,0.06)', color: 'rgba(148,163,184,0.35)', border: '1px solid rgba(148,163,184,0.08)' }}>
                {code.split('\n').length} lines
              </span>
              {isPlaying && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                  ▶ Playing
                </span>
              )}
            </div>

            {/* Editor AI Buttons */}
            {getApiKey() && (
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleOptimizeCode()}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all duration-150 border"
                  style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#93c5fd' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}>
                  {isOptimizing ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                  <span>Optimize</span>
                </button>
                <button onClick={() => { setIsEdgeCaseOpen(true); if (edgeCases.length === 0) handleGenerateEdgeCases(); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all duration-150 border"
                  style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)', color: '#fcd34d' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.16)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}>
                  <Target size={10} />
                  <span>Stress Tests</span>
                </button>
                <button onClick={() => setIsTutorOpen(p => !p)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all duration-150 border"
                  style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.25)', color: '#c4b5fd' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}>
                  <Bot size={10} />
                  <span>Ask Tutor</span>
                </button>
              </div>
            )}
          </div>

          {/* Monaco Editor + Overlay */}
          <div className="flex-1 min-h-0 relative">
            <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={code}
              onChange={v => setCode(v || '')}
              onMount={editor => { editorRef.current = editor; }}
              options={{
                minimap: { enabled: false }, fontSize: 13.5, lineHeight: 22,
                fontFamily: 'var(--font-mono)', fontLigatures: true,
                scrollBeyondLastLine: false, padding: { top: 14, bottom: 14 },
                renderLineHighlight: 'gutter', glyphMargin: true,
                readOnly: isPlaying, cursorBlinking: 'smooth',
                lineNumbersMinChars: 3,
              }} />

            {/* Optimization Ready Toast */}
            {optimizationResult && !isOptimizerOpen && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl cursor-pointer animate-slide-in-up"
                style={{ background: 'rgba(12,16,34,0.96)', border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(59,130,246,0.1)', backdropFilter: 'blur(16px)' }}
                onClick={() => setIsOptimizerOpen(true)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}>
                    <Zap size={15} style={{ color: '#93c5fd' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {optimizationResult.interview_optimization?.technique || 'Interview-Ready Optimization'}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
                        {optimizationResult.interview_optimization?.time_complexity || 'O(N)'}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.6)' }}>
                      Zero built-ins · Click to view full analysis
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white"
                    style={{ background: 'rgba(59,130,246,0.8)' }}>
                    View Solution
                  </span>
                  <button onClick={e => { e.stopPropagation(); setOptimizationResult(null); }}
                    className="text-xs p-1 rounded cursor-pointer"
                    style={{ color: 'rgba(148,163,184,0.4)' }}>✕</button>
                </div>
              </div>
            )}
          </div>

          {/* Connection Error */}
          {fetchError && (
            <div className="px-4 py-3 shrink-0 flex items-start gap-2.5"
              style={{ background: 'rgba(127,29,29,0.2)', borderTop: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} />
              <div className="text-xs" style={{ color: '#fca5a5' }}>
                <strong>Backend Offline:</strong> {fetchError}
                <span className="block mt-0.5" style={{ color: 'rgba(252,165,165,0.5)' }}>
                  Start with: <code style={{ fontFamily: 'var(--font-mono)' }}>uvicorn main:app --reload</code> (port 8000)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Trace Pane ────────────────────────────────────────────── */}
        <div className="flex flex-col min-h-0" style={{ width: '45%', background: 'rgba(9,13,25,0.5)' }}>

          {/* ── Step Info Bar ─── */}
          {hasRun && activeStep ? (
            <div className="shrink-0">
              {/* Step Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-l-4"
                style={{
                  background: es.bg.includes('blue') ? 'rgba(59,130,246,0.07)' : es.bg.includes('emerald') ? 'rgba(16,185,129,0.07)' : 'rgba(139,92,246,0.07)',
                  borderBottomColor: 'var(--border-subtle)',
                  borderLeftColor: es.bg.includes('blue') ? '#3b82f6' : es.bg.includes('emerald') ? '#10b981' : '#8b5cf6',
                }}>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full uppercase"
                    style={{
                      background: es.bg.includes('blue') ? 'rgba(59,130,246,0.2)' : es.bg.includes('emerald') ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)',
                      color: es.bg.includes('blue') ? '#93c5fd' : es.bg.includes('emerald') ? '#6ee7b7' : '#c4b5fd',
                      border: `1px solid ${es.bg.includes('blue') ? 'rgba(59,130,246,0.4)' : es.bg.includes('emerald') ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.4)'}`,
                    }}>
                    {es.label}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    Line <span className="font-mono font-bold" style={{ color: '#e2e8f0' }}>{activeStep.line}</span>
                  </span>
                  <span style={{ color: 'rgba(148,163,184,0.3)' }}>·</span>
                  <span className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    Step <span className="font-mono font-bold" style={{ color: '#e2e8f0' }}>{currentStep + 1}</span>
                    <span style={{ color: 'rgba(148,163,184,0.4)' }}>/{steps.length}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: es.bg.includes('blue') ? '#3b82f6' : es.bg.includes('emerald') ? '#10b981' : '#8b5cf6' }} />
                  <span className="text-xs" style={{ color: 'rgba(148,163,184,0.55)' }}>
                    {activeStep.event === 'call' ? 'Function called' : activeStep.event === 'return' ? 'Returning' : 'Executing'}
                  </span>
                  {getApiKey() && (
                    <button onClick={() => handleExplainStep(currentStep)} disabled={isExplainingStep}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all duration-150 border ml-2"
                      style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.3)', color: '#c4b5fd' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}>
                      <Sparkles size={10} />
                      <span>{stepExplanations[currentStep] ? '✓ Explained' : 'Explain'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Step Explanation */}
              {stepExplanations[currentStep] && (
                <div className="px-4 py-2.5 border-b animate-fade-in"
                  style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
                  <p className="text-xs leading-relaxed">
                    <strong style={{ color: '#a78bfa' }}>✦ AI Tutor: </strong>
                    <span style={{ color: 'rgba(221,214,254,0.9)' }}>{stepExplanations[currentStep]}</span>
                  </p>
                </div>
              )}
              {isExplainingStep && !stepExplanations[currentStep] && (
                <div className="px-4 py-2.5 border-b flex items-center gap-2"
                  style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
                  <Loader2 size={11} className="animate-spin" style={{ color: '#a78bfa' }} />
                  <span className="text-xs" style={{ color: 'rgba(196,181,253,0.7)' }}>Generating explanation…</span>
                </div>
              )}
            </div>
          ) : !hasRun ? (
            /* ── Empty State: Onboarding ─── */
            <div className="shrink-0 px-5 py-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center animate-float"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Rocket size={22} style={{ color: '#93c5fd' }} />
                </div>
                <h2 className="text-sm font-bold text-white mb-1">Ready to Trace</h2>
                <p className="text-xs" style={{ color: 'rgba(148,163,184,0.55)' }}>
                  Pick an algorithm above, then hit <span className="font-bold" style={{ color: '#93c5fd' }}>Run Trace</span>
                </p>
              </div>
              <div className="space-y-2">
                {[
                  { icon: '🔍', text: 'Every line & function call captured step-by-step' },
                  { icon: '📊', text: 'Variable state visualized at each execution point' },
                  { icon: '🤖', text: 'AI explains complexity, errors & each step in plain English' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border-subtle)' }}>
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs" style={{ color: 'rgba(148,163,184,0.65)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── AI Complexity Banner ─── */}
          {hasRun && (
            <div className="shrink-0 border-b" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
              {complexityLoading ? (
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(139,92,246,0.05)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                    <Loader2 size={13} className="animate-spin" style={{ color: '#a78bfa' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>
                    AI analyzing time & space complexity…
                  </span>
                </div>
              ) : complexity?.summary ? (
                <div className="px-4 py-3 animate-fade-in" style={{ background: 'rgba(139,92,246,0.07)' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 shrink-0"
                      style={{ background: 'rgba(139,92,246,0.25)' }}>
                      <Zap size={12} style={{ color: '#a78bfa' }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>AI Analysis</span>
                      <p className="text-[12px] leading-relaxed mt-0.5" style={{ color: 'rgba(221,214,254,0.85)' }}>
                        {complexity.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ── Status Banners ─── */}
          {hasRun && (
            <StatusBanner
              error={traceError} truncated={truncated} timedOut={timedOut}
              isAnalyzing={isAnalyzingError} analysisResult={errorAnalysis}
              onAnalyze={getApiKey() ? handleAnalyzeError : undefined}
              onApplyFix={(fixedCode) => { setCode(fixedCode); setErrorAnalysis(null); handleRun(fixedCode); }}
            />
          )}

          {/* ── Tab Bar ─── */}
          {hasRun && (
            <div className="flex shrink-0 border-b" style={{ background: 'rgba(9,13,25,0.6)', borderColor: 'var(--border-subtle)' }}>
              {[
                { id: 'variables', label: 'Variables', icon: Braces },
                { id: 'timeline', label: 'Timeline', icon: Activity }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all duration-150"
                  style={activeTab === tab.id ? {
                    borderColor: '#6366f1', color: '#a5b4fc', background: 'rgba(99,102,241,0.06)'
                  } : {
                    borderColor: 'transparent', color: 'rgba(148,163,184,0.5)', background: 'transparent'
                  }}>
                  <tab.icon size={12} />
                  {tab.label}
                  {tab.id === 'timeline' && (
                    <span className="ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(148,163,184,0.12)', color: 'rgba(148,163,184,0.55)' }}>
                      {steps.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── Scrollable Content Area ─── */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">

            {/* Before run: sandbox info */}
            {!hasRun && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--border-muted)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal size={13} style={{ color: '#60a5fa' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#60a5fa' }}>Sandbox Built-ins</span>
                  </div>
                  <p className="text-xs mb-2.5" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    Code runs safely in an isolated Python sandbox:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {['abs','all','any','bool','chr','dict','divmod','enumerate','filter','float','frozenset','int','isinstance','len','list','map','max','min','ord','pow','print','range','repr','reversed','round','set','sorted','str','sum','tuple','zip','type'].map(b => (
                      <code key={b} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'rgba(34,197,94,0.08)', color: '#86efac', border: '1px solid rgba(34,197,94,0.15)' }}>
                        {b}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--border-muted)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap size={13} style={{ color: '#a78bfa' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>AI Features</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      ['⚡', 'Optimize code for interviews (no built-in functions)'],
                      ['🎯', 'Generate algorithmic stress-test edge cases'],
                      ['🤖', 'Ask AlgoTutor — context-aware AI copilot'],
                      ['✦', 'Step-by-step AI explanations of variable changes'],
                      ['🔍', 'Crash analyzer with auto-fix suggestions'],
                    ].map(([icon, text], i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
                        <span className="shrink-0 mt-0.5">{icon}</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Variables Tab */}
            {hasRun && activeTab === 'variables' && (
              <>
                {activeStep?.variables?.arr !== undefined ? (
                  <ArrayVisualizer arr={activeStep.variables.arr} vars={activeStep.variables} />
                ) : activeStep?.variables?.series !== undefined && Array.isArray(activeStep.variables.series) ? (
                  <div className="rounded-xl p-4" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--border-muted)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <List size={13} style={{ color: '#fbbf24' }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#fbbf24' }}>Fibonacci Series</span>
                      <span className="text-xs font-mono ml-1" style={{ color: 'rgba(148,163,184,0.4)' }}>
                        [{activeStep.variables.series.length}]
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {activeStep.variables.series.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className="w-11 h-11 flex items-center justify-center text-sm font-bold rounded-xl border-2 transition-all duration-300"
                            style={{ background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.5)', color: '#fef3c7', boxShadow: '0 4px 12px rgba(245,158,11,0.1)' }}>
                            {val}
                          </div>
                          <span className="text-[9px] font-mono" style={{ color: 'rgba(148,163,184,0.4)' }}>{idx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <ScalarVisualizer vars={activeStep?.variables} />

                {/* Variables Table */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--border-muted)' }}>
                  <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                      <Braces size={12} style={{ color: 'rgba(148,163,184,0.4)' }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
                        Local Variables
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(148,163,184,0.08)', color: 'rgba(148,163,184,0.4)', border: '1px solid var(--border-subtle)' }}>
                      {Object.keys(activeStep?.variables || {}).length} vars
                    </span>
                  </div>
                  {activeStep && Object.keys(activeStep.variables || {}).length > 0 ? (
                    <div>
                      {Object.entries(activeStep.variables).map(([n, v]) => (
                        <VariableRow key={n} name={n} val={v} prevVal={prevStep?.variables?.[n]} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center py-6" style={{ color: 'rgba(148,163,184,0.3)' }}>
                      No local variables in scope
                    </p>
                  )}
                </div>

                {/* Complexity Cards */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid var(--border-muted)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu size={13} style={{ color: '#60a5fa' }} />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#60a5fa' }}>
                      Time & Space Complexity
                    </span>
                    {complexityLoading && <Loader2 size={11} className="animate-spin ml-1" style={{ color: '#60a5fa' }} />}
                  </div>
                  {complexityLoading ? (
                    <div className="flex gap-2">
                      {['Time', 'Space'].map(label => (
                        <div key={label} className="flex-1 rounded-xl px-3 py-3 skeleton" style={{ minHeight: '56px' }} />
                      ))}
                    </div>
                  ) : complexity ? (
                    <div className="flex gap-3">
                      <div className="flex-1 rounded-xl px-3 py-3 border"
                        style={{ background: 'rgba(59,130,246,0.07)', borderColor: 'rgba(59,130,246,0.2)' }}>
                        <div className="flex items-center gap-1 mb-1.5">
                          <Cpu size={10} style={{ color: '#60a5fa' }} />
                          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'rgba(148,163,184,0.5)' }}>Time</span>
                        </div>
                        <span className="font-mono text-lg font-extrabold" style={{ color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>
                          {complexity.time}
                        </span>
                      </div>
                      <div className="flex-1 rounded-xl px-3 py-3 border"
                        style={{ background: 'rgba(34,197,94,0.07)', borderColor: 'rgba(34,197,94,0.2)' }}>
                        <div className="flex items-center gap-1 mb-1.5">
                          <MemoryStick size={10} style={{ color: '#4ade80' }} />
                          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'rgba(148,163,184,0.5)' }}>Space</span>
                        </div>
                        <span className="font-mono text-lg font-extrabold" style={{ color: '#86efac', fontFamily: 'var(--font-mono)' }}>
                          {complexity.space}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-center py-3" style={{ color: 'rgba(148,163,184,0.3)' }}>
                      {getApiKey() ? 'Analysis unavailable' : 'Set VITE_GROQ_API_KEY to enable'}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Timeline Tab */}
            {hasRun && activeTab === 'timeline' && (
              <div ref={timelineRef} className="space-y-0.5">
                {steps.map((step, idx) => {
                  const se = EVENT_STYLES[step.event] || EVENT_STYLES.line;
                  const isCur = idx === currentStep;
                  const varPreview = Object.entries(step.variables || {}).slice(0, 3)
                    .map(([k, v]) => `${k}=${Array.isArray(v) ? `[${v.length}]` : typeof v === 'object' && v ? '{…}' : v}`)
                    .join(', ');
                  const dotColor = se.dot.includes('blue') ? '#3b82f6' : se.dot.includes('emerald') ? '#10b981' : '#8b5cf6';
                  return (
                    <button key={idx} data-step={idx} onClick={() => jumpTo(idx)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer transition-all duration-100"
                      style={isCur ? {
                        background: `rgba(${se.bg.includes('blue') ? '59,130,246' : se.bg.includes('emerald') ? '16,185,129' : '139,92,246'},0.1)`,
                        border: `1px solid rgba(${se.bg.includes('blue') ? '59,130,246' : se.bg.includes('emerald') ? '16,185,129' : '139,92,246'},0.3)`,
                      } : {
                        background: 'transparent',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isCur) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (!isCur) e.currentTarget.style.background = 'transparent'; }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                        style={{ background: dotColor, opacity: isCur ? 1 : 0.25 }} />
                      <span className="text-[10px] font-bold font-mono w-14 shrink-0"
                        style={{ color: isCur ? (se.text.includes('blue') ? '#93c5fd' : se.text.includes('emerald') ? '#6ee7b7' : '#c4b5fd') : 'rgba(148,163,184,0.3)', fontFamily: 'var(--font-mono)' }}>
                        {se.label}
                      </span>
                      <span className="text-xs font-mono shrink-0"
                        style={{ color: isCur ? '#e2e8f0' : 'rgba(148,163,184,0.3)', fontFamily: 'var(--font-mono)' }}>
                        L{step.line}
                      </span>
                      <span className="text-[10px] font-mono ml-auto shrink-0"
                        style={{ color: isCur ? 'rgba(148,163,184,0.6)' : 'rgba(148,163,184,0.2)', fontFamily: 'var(--font-mono)' }}>
                        #{step.step}
                      </span>
                      <span className="text-[10px] truncate max-w-[110px]"
                        style={{ color: isCur ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.2)' }}>
                        {varPreview}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Playback Controls ─── */}
          {hasRun && steps.length > 0 && (
            <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(9,13,25,0.85)', backdropFilter: 'blur(8px)' }}>
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] font-mono mb-1.5" style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'var(--font-mono)' }}>
                  <span>Step 1</span>
                  <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{currentStep + 1} / {steps.length}</span>
                  <span>{steps.length}</span>
                </div>
                <input type="range" min={0} max={steps.length - 1} value={currentStep}
                  onChange={e => jumpTo(Number(e.target.value))}
                  className="w-full cursor-pointer" />
                {/* Progress fill indicator */}
                <div className="h-0.5 rounded-full mt-1 transition-all duration-150"
                  style={{ background: 'rgba(99,102,241,0.2)', position: 'relative' }}>
                  <div className="h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                {/* Speed */}
                <div className="flex gap-1">
                  {SPEEDS.map((s, i) => (
                    <button key={i} onClick={() => setSpeedIdx(i)}
                      className="text-[10px] font-mono font-bold px-2 py-1 rounded-md border cursor-pointer transition-all duration-100"
                      style={speedIdx === i ? {
                        background: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc'
                      } : {
                        background: 'transparent', borderColor: 'var(--border-muted)', color: 'rgba(148,163,184,0.4)'
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Nav Buttons */}
                <div className="flex items-center gap-1">
                  <button id="first-btn" onClick={() => jumpTo(0)} disabled={currentStep === 0} title="First"
                    className="p-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ color: 'rgba(148,163,184,0.5)' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; }}>
                    <ChevronsLeft size={17} />
                  </button>
                  <button id="prev-btn" onClick={() => jumpTo(Math.max(0, currentStep - 1))} disabled={currentStep === 0} title="Previous"
                    className="p-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ color: 'rgba(148,163,184,0.6)' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; }}>
                    <SkipBack size={19} />
                  </button>
                  <button id="play-btn" onClick={() => setIsPlaying(p => !p)}
                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 animate-pulse-glow"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}>
                    {isPlaying ? <Pause size={15} className="text-white" /> : <Play size={15} className="text-white ml-0.5" />}
                  </button>
                  <button id="next-btn" onClick={() => jumpTo(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1} title="Next"
                    className="p-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ color: 'rgba(148,163,184,0.6)' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; }}>
                    <SkipForward size={19} />
                  </button>
                  <button id="last-btn" onClick={() => jumpTo(steps.length - 1)} disabled={currentStep === steps.length - 1} title="Last"
                    className="p-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{ color: 'rgba(148,163,184,0.5)' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; }}>
                    <ChevronsRight size={17} />
                  </button>
                </div>

                {/* Reset */}
                <button id="reset-trace-btn" onClick={() => {
                  setSteps([]); setHasRun(false); setCurrentStep(0); setIsPlaying(false);
                  if (editorRef.current) decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
                }}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border"
                  style={{ color: 'rgba(148,163,184,0.45)', borderColor: 'var(--border-subtle)', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'var(--border-muted)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.45)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}>
                  <RefreshCw size={10} /> Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals & Drawers ──────────────────────────────────────────────── */}

      <OptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        isLoading={isOptimizing}
        optimizationResult={optimizationResult}
        onApplyCode={handleApplyOptimizedCode}
        onReoptimize={() => handleOptimizeCode(true)}
      />

      <EdgeCaseModal
        isOpen={isEdgeCaseOpen}
        onClose={() => setIsEdgeCaseOpen(false)}
        isLoading={isGeneratingEdgeCases}
        testCases={edgeCases}
        onGenerate={handleGenerateEdgeCases}
        onApplyCase={handleApplyEdgeCase}
      />

      <AlgoTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        messages={tutorMessages}
        isTyping={isTutorTyping}
        onSendMessage={handleSendTutorMessage}
        onClearMessages={handleClearTutor}
        currentStep={currentStep}
        totalSteps={steps.length}
        activeStep={activeStep}
        hasRun={hasRun}
      />
    </div>
  );
}
