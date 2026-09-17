import React from 'react';
import { Clock, Hash, AlertTriangle, Sparkles, Loader2, Zap, CheckCircle2 } from 'lucide-react';

export function StatusBanner({ error, truncated, timedOut, isAnalyzing, analysisResult, onAnalyze, onApplyFix }) {
  if (!error && !truncated && !timedOut) return null;

  return (
    <div className="px-3 py-2 space-y-2 shrink-0">
      {/* Timed Out */}
      {timedOut && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs animate-fade-in"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(245,158,11,0.2)' }}>
            <Clock size={12} style={{ color: '#fbbf24' }} />
          </div>
          <span style={{ color: '#fde68a' }}>
            <strong>Timed Out</strong> — Exceeded 5s wall-clock limit. Trace may be incomplete.
          </span>
        </div>
      )}

      {/* Truncated */}
      {truncated && !timedOut && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs animate-fade-in"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(249,115,22,0.2)' }}>
            <Hash size={12} style={{ color: '#fb923c' }} />
          </div>
          <span style={{ color: '#fdba74' }}>
            <strong>Truncated</strong> — Hit the max-steps cap. Increase limit or simplify code.
          </span>
        </div>
      )}

      {/* Runtime Error */}
      {error && (
        <div className="rounded-xl overflow-hidden animate-fade-in"
          style={{ background: 'rgba(127,29,29,0.25)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="flex items-start justify-between gap-3 px-3 py-3">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(239,68,68,0.2)' }}>
                <AlertTriangle size={12} style={{ color: '#f87171' }} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5"
                  style={{ color: '#f87171' }}>
                  Runtime Error
                </span>
                <span className="text-xs leading-relaxed" style={{ color: '#fca5a5', fontFamily: "'JetBrains Mono',monospace" }}>
                  {error}
                </span>
              </div>
            </div>
            {onAnalyze && (
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}>
                {isAnalyzing
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Sparkles size={11} />}
                {isAnalyzing ? 'Analyzing…' : 'AI Fix'}
              </button>
            )}
          </div>

          {/* AI Analysis Result */}
          {analysisResult && (
            <div className="px-3 py-3 border-t animate-fade-in"
              style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(0,0,0,0.15)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} style={{ color: '#f87171' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#f87171' }}>AI Analysis</span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(252,165,165,0.85)' }}>
                {analysisResult.explanation}
              </p>
              <button
                onClick={() => onApplyFix(analysisResult.fixed_code)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150"
                style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.32)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}>
                <CheckCircle2 size={12} />
                Apply AI Fix & Run Trace
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
