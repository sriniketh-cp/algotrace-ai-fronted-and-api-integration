import React, { useState } from 'react';
import { Target, X, Zap, Play, Loader2, Sparkles, AlertCircle, ShieldAlert, ArrowRight, Code } from 'lucide-react';

const CATEGORY_STYLES = {
  'Worst Case': {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    border: 'hover:border-rose-500/50',
    btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
  },
  'Best Case': {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    border: 'hover:border-emerald-500/50',
    btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
  },
  'Boundary Condition': {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    border: 'hover:border-amber-500/50',
    btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
  },
  'Duplicates & Edge Values': {
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-400',
    border: 'hover:border-cyan-500/50',
    btn: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
  },
};

export function EdgeCaseModal({
  isOpen,
  onClose,
  isLoading,
  testCases = [],
  onGenerate,
  onApplyCase
}) {
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#0b0f1e] border border-slate-700/70 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Target size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">AI Edge Case &amp; Stress-Test Generator</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Feature 3</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Diagnose asymptotic bounds, tricky invariants, and boundary vulnerabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                <Sparkles size={16} className="absolute inset-0 m-auto text-amber-400 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Analyzing algorithm logic &amp; synthesizing stress tests...</p>
              <p className="text-xs text-slate-500 max-w-sm">Generating reverse arrays, identical values, empty edge conditions, and corner bounds.</p>
            </div>
          ) : testCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400">
                <ShieldAlert size={28} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-slate-200">No Stress Tests Generated Yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The AI inspects your current algorithm and constructs adversarial inputs (such as already-sorted, reversed, duplicate, or empty sets) to verify code resilience.
                </p>
              </div>
              <button
                onClick={onGenerate}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/20 cursor-pointer transition-all duration-200"
              >
                <Sparkles size={14} /> Generate 4 Stress Tests
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Generated Stress Scenarios</span>
                  <span className="text-[11px] font-mono text-slate-500">({testCases.length} tests)</span>
                </div>
                <button
                  onClick={onGenerate}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles size={12} /> Regenerate Tests
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {testCases.map((tc, idx) => {
                  const style = CATEGORY_STYLES[tc.category] || CATEGORY_STYLES['Worst Case'];
                  const isPreviewing = selectedPreviewId === tc.id;

                  return (
                    <div
                      key={tc.id || idx}
                      className={`flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4 transition-all duration-200 ${style.border}`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                            <h4 className="text-xs font-bold text-slate-200">{tc.name}</h4>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                            {tc.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {tc.description}
                        </p>

                        {tc.rationale && (
                          <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-semibold mb-1">
                              <Zap size={10} />
                              <span>Why It Matters</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              {tc.rationale}
                            </p>
                          </div>
                        )}

                        {isPreviewing && tc.modified_code && (
                          <div className="mt-2 bg-slate-950 rounded-lg p-2.5 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-32">
                            <pre>{tc.modified_code}</pre>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-800/70">
                        {tc.modified_code && (
                          <button
                            onClick={() => setSelectedPreviewId(isPreviewing ? null : tc.id)}
                            className="text-[11px] text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Code size={11} /> {isPreviewing ? 'Hide Code' : 'Preview'}
                          </button>
                        )}
                        <button
                          onClick={() => onApplyCase(tc.modified_code)}
                          className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg shadow-md cursor-pointer transition-all duration-150 ${style.btn}`}
                        >
                          <Play size={11} fill="currentColor" /> Apply &amp; Run Trace
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Zap size={12} className="text-amber-400" />
            <span>Clicking "Apply &amp; Run Trace" replaces input variables and starts execution analysis.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
