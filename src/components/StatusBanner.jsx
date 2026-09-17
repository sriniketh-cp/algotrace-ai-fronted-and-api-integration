import React from 'react';
import { Clock, Hash, AlertTriangle, Sparkles, Loader2, Zap } from 'lucide-react';

export function StatusBanner({ error, truncated, timedOut, isAnalyzing, analysisResult, onAnalyze, onApplyFix }) {
  if (!error && !truncated && !timedOut) return null;
  return (
    <div className="px-4 py-2 space-y-2 shrink-0">
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
        <div className="flex flex-col gap-2 bg-red-500/15 border border-red-500/40 rounded-lg px-3 py-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2 text-red-300 text-xs mt-0.5">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              <span><strong>Runtime Error:</strong> {error}</span>
            </div>
            {onAnalyze && (
              <button 
                onClick={onAnalyze} 
                disabled={isAnalyzing} 
                className="shrink-0 flex items-center gap-1.5 bg-red-950 hover:bg-red-900 border border-red-800/50 text-red-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                Analyze Error
              </button>
            )}
          </div>
          
          {analysisResult && (
            <div className="mt-2 border-t border-red-500/20 pt-3">
              <div className="flex items-center gap-2 text-red-300 mb-2">
                <Zap size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">AI Analysis</span>
              </div>
              <p className="text-xs text-red-100 leading-relaxed mb-3">
                {analysisResult.explanation}
              </p>
              <button 
                onClick={() => onApplyFix(analysisResult.fixed_code)}
                className="flex items-center justify-center w-full bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                Apply Fix & Trace
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
