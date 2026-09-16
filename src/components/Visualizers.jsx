import React, { useState } from 'react';
import { ChevronRight, ChevronDown, List, Binary } from 'lucide-react';
import { getVarType } from '../utils/helpers';
import { TYPE_STYLES } from '../utils/constants';

export function ValueDisplay({ val, depth = 0 }) {
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

export function TypeBadge({ val }) {
  const type = getVarType(val);
  return (
    <span className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border ${TYPE_STYLES[type] || TYPE_STYLES.unknown}`}>
      {type}
    </span>
  );
}

export function VariableRow({ name, val, prevVal }) {
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

export function ArrayVisualizer({ arr, vars }) {
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

export function ScalarVisualizer({ vars }) {
  if (!vars) return null;
  const scalars = Object.entries(vars).filter(([k,v]) => 
    (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') 
    && !['arr', 'i', 'j', 'series'].includes(k)
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
