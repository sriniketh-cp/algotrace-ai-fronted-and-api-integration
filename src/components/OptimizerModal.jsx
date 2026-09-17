import React, { useState } from 'react';
import {
  Zap,
  X,
  Play,
  Loader2,
  ShieldCheck,
  Check,
  Copy,
  Clock,
  HardDrive,
  Sparkles,
  GraduationCap,
  Terminal,
  Code2,
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react';

export function OptimizerModal({
  isOpen,
  onClose,
  isLoading,
  optimizationResult,
  onApplyCode,
  onReoptimize
}) {
  const [activeTab, setActiveTab] = useState('interview'); // 'interview' | 'pythonic'
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const interviewOpt = optimizationResult?.interview_optimization;
  const pythonicOpt = optimizationResult?.pythonic_optimization;

  // Current active optimization data
  const currentOpt = activeTab === 'interview' ? interviewOpt : pythonicOpt;
  const currentCode = currentOpt?.code || optimizationResult?.optimized_code || '';

  const handleCopy = () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleApply = () => {
    if (!currentCode) return;
    onApplyCode(currentCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0b0f1e] border border-slate-700/70 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">AI Complexity &amp; Code Optimizer</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Feature 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Optimize asymptotic runtime &amp; auxiliary space — with strict interview constraints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'interview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border border-blue-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <GraduationCap size={15} className={activeTab === 'interview' ? 'text-amber-300' : 'text-slate-400'} />
              <span>Interview &amp; Exam Mode</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold ml-0.5">
                Zero Built-ins
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pythonic')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pythonic'
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Sparkles size={14} className={activeTab === 'pythonic' ? 'text-violet-400' : 'text-slate-400'} />
              <span>Standard Pythonic</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold ml-0.5">
                Idiomatic
              </span>
            </button>
          </div>

          {onReoptimize && (
            <button
              onClick={onReoptimize}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Zap size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>{isLoading ? 'Re-analyzing…' : 'Re-analyze Code'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center animate-pulse">
                  <Zap size={26} className="text-blue-400 animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 animate-ping" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Analyzing Algorithmic Bottlenecks…</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Our AI Professor is synthesizing from-scratch loops and pointer invariants with strictly zero built-in functions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
                <Loader2 size={13} className="animate-spin" />
                <span>Enforcing zero-builtins rule (No sorted, sum, max, min, set)…</span>
              </div>
            </div>
          ) : currentOpt ? (
            <>
              {/* Interview Mode Zero-Builtin Guarantee Banner */}
              {activeTab === 'interview' ? (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                  <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-emerald-300">Zero Built-in Functions Guaranteed: </span>
                    Strictly avoids <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-200">sorted()</code>,{' '}
                    <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-200">sum()</code>,{' '}
                    <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-200">max()</code>,{' '}
                    <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-200">min()</code>,{' '}
                    <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-emerald-200">set()</code>, or helper libraries.
                    Implemented using fundamental loops, index pointers, and in-place manipulation as required by university professors and interviewers.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-200">
                  <Sparkles size={18} className="text-violet-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-violet-300">Production Idiomatic Optimization: </span>
                    Leverages standard Pythonic constructs for clean, high-performance readable production code without external imports.
                  </div>
                </div>
              )}

              {/* Technique Pill & Complexity Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Algorithmic Technique */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Code2 size={13} className="text-blue-400" /> Algorithmic Technique
                  </span>
                  <div className="mt-2">
                    <span className="text-sm font-bold text-white">
                      {currentOpt.technique || (activeTab === 'interview' ? 'Two-Pointer / Manual In-Place' : 'Idiomatic Python')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {activeTab === 'interview' ? 'Manual loop-based pattern' : 'Standard Pythonic idiom'}
                  </span>
                </div>

                {/* Time Complexity */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-400" /> Time Complexity
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-mono font-bold text-amber-300">
                      {currentOpt.time_complexity || 'O(N)'}
                    </span>
                    {currentOpt.time_reduction && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        {currentOpt.time_reduction}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">Asymptotic execution bounds</span>
                </div>

                {/* Space Complexity */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                    <HardDrive size={13} className="text-cyan-400" /> Space Complexity
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-mono font-bold text-cyan-300">
                      {currentOpt.space_complexity || 'O(1)'}
                    </span>
                    {currentOpt.space_reduction && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        {currentOpt.space_reduction}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">Auxiliary memory footprint</span>
                </div>
              </div>

              {/* Interviewer / Professor Focus Callout */}
              {activeTab === 'interview' && currentOpt.interviewer_focus && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-blue-950/30 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                    <Award size={14} />
                    <span>What Professors &amp; Interviewers Are Testing</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentOpt.interviewer_focus}
                  </p>
                </div>
              )}

              {/* Rationale */}
              {currentOpt.rationale && (
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-200">How It Works: </strong>
                  {currentOpt.rationale}
                </div>
              )}

              {/* Code Preview Section */}
              <div className="rounded-xl border border-slate-800 bg-[#070a14] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/70 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-slate-400" />
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {activeTab === 'interview' ? 'manual_optimized.py (Zero Built-ins)' : 'pythonic_optimized.py'}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {hasCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{hasCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed text-slate-200">
                  <pre>{currentCode}</pre>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Zap size={32} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No optimization results available.</p>
              {onReoptimize && (
                <button
                  onClick={onReoptimize}
                  className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Analyze &amp; Optimize Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Compatible with AlgoTrace sandbox (Zero imports)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              id="apply-optimized-code-btn"
              onClick={handleApply}
              disabled={!currentCode || isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all duration-150 cursor-pointer"
            >
              <Play size={13} />
              <span>Apply to Editor &amp; Run Trace</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
