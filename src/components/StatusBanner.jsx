import React from 'react';
import { Clock, Hash, AlertTriangle } from 'lucide-react';

export function StatusBanner({ error, truncated, timedOut }) {
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
