import React, { useState } from 'react';
import { ChevronRight, ChevronDown, List, Binary } from 'lucide-react';
import { getVarType } from '../utils/helpers';
import { TYPE_STYLES } from '../utils/constants';

/* ─── Shared token helpers ────────────────────────────────────────────────── */
const MONO = "'JetBrains Mono','Fira Code',monospace";

const TYPE_COLORS = {
  int:    { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  text: '#93c5fd' },
  float:  { bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   text: '#67e8f9' },
  str:    { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   text: '#86efac' },
  bool:   { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  text: '#d8b4fe' },
  array:  { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  text: '#fdba74' },
  dict:   { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.3)',  text: '#f9a8d4' },
  null:   { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', text: 'rgba(148,163,184,0.5)' },
  unknown:{ bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)', text: 'rgba(148,163,184,0.5)' },
};

/* ─── ValueDisplay ────────────────────────────────────────────────────────── */
export function ValueDisplay({ val, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1);
  const type = getVarType(val);

  if (type === 'array') {
    return (
      <span>
        <button onClick={() => setOpen(o => !o)}
          className="cursor-pointer transition-colors"
          style={{ color: '#fdba74', fontFamily: MONO, fontSize: '12px' }}>
          {open
            ? <ChevronDown size={10} style={{ display: 'inline', marginRight: '2px' }} />
            : <ChevronRight size={10} style={{ display: 'inline', marginRight: '2px' }} />}
          [{val.length}]
        </button>
        {open && (
          <div style={{ marginLeft: '16px', marginTop: '4px' }} className="space-y-0.5">
            {val.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span style={{ color: 'rgba(148,163,184,0.35)', fontFamily: MONO, width: '16px', textAlign: 'right', flexShrink: 0 }}>{i}</span>
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
        <button onClick={() => setOpen(o => !o)}
          className="cursor-pointer transition-colors"
          style={{ color: '#f9a8d4', fontFamily: MONO, fontSize: '12px' }}>
          {open
            ? <ChevronDown size={10} style={{ display: 'inline', marginRight: '2px' }} />
            : <ChevronRight size={10} style={{ display: 'inline', marginRight: '2px' }} />}
          {`{${entries.length}}`}
        </button>
        {open && (
          <div style={{ marginLeft: '16px', marginTop: '4px' }} className="space-y-0.5">
            {entries.map(([k, v]) => (
              <div key={k} className="flex items-start gap-2 text-xs">
                <span style={{ color: '#f9a8d4', fontFamily: MONO }}>"{k}":</span>
                <ValueDisplay val={v} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (type === 'str')  return <span style={{ color: '#86efac', fontFamily: MONO, fontSize: '12px' }}>"{val}"</span>;
  if (type === 'bool') return <span style={{ color: '#d8b4fe', fontFamily: MONO, fontSize: '12px' }}>{String(val)}</span>;
  if (type === 'null') return <span style={{ color: 'rgba(148,163,184,0.4)', fontFamily: MONO, fontSize: '12px' }}>None</span>;
  return <span style={{ color: '#fde68a', fontFamily: MONO, fontSize: '12px' }}>{String(val)}</span>;
}

/* ─── TypeBadge ───────────────────────────────────────────────────────────── */
export function TypeBadge({ val }) {
  const type = getVarType(val);
  const colors = TYPE_COLORS[type] || TYPE_COLORS.unknown;
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md"
      style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, fontFamily: MONO }}>
      {type}
    </span>
  );
}

/* ─── VariableRow ─────────────────────────────────────────────────────────── */
export function VariableRow({ name, val, prevVal }) {
  const changed = prevVal !== undefined && JSON.stringify(val) !== JSON.stringify(prevVal);
  return (
    <div className="flex items-start gap-3 px-3 py-2.5 transition-all duration-300"
      style={changed ? {
        background: 'rgba(245,158,11,0.07)',
        borderLeft: '2px solid rgba(245,158,11,0.5)',
      } : {
        borderLeft: '2px solid transparent',
      }}
      onMouseEnter={e => { if (!changed) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
      onMouseLeave={e => { if (!changed) e.currentTarget.style.background = 'transparent'; }}>
      <div className="flex items-center gap-2 w-36 shrink-0 min-w-0">
        {changed && (
          <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
            style={{ background: '#fbbf24', boxShadow: '0 0 6px rgba(251,191,36,0.5)' }} />
        )}
        <span className="font-bold text-sm truncate"
          style={{ color: changed ? '#fde68a' : '#e2e8f0', fontFamily: MONO }}>
          {name}
        </span>
      </div>
      <TypeBadge val={val} />
      <div className="flex-1 overflow-hidden min-w-0">
        <ValueDisplay val={val} depth={0} />
      </div>
    </div>
  );
}

/* ─── ArrayVisualizer ─────────────────────────────────────────────────────── */
export function ArrayVisualizer({ arr, vars }) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const { i, j, mid, left, right } = vars || {};
  const MAX = 20;

  const getCellStyle = (idx) => {
    const isJ    = j !== undefined && (idx === j || idx === j + 1);
    const isMid  = mid !== undefined && idx === mid;
    const isLeft = left !== undefined && idx === left;
    const isRight= right !== undefined && idx === right;
    const isI    = i !== undefined && idx === i;

    if (isMid)   return { bg: 'rgba(99,102,241,0.3)',  border: '#818cf8', text: '#fff', shadow: '0 4px 14px rgba(99,102,241,0.4)', label: 'mid', transform: 'translateY(-4px)' };
    if (isLeft)  return { bg: 'rgba(16,185,129,0.3)',  border: '#34d399', text: '#fff', shadow: '0 4px 14px rgba(16,185,129,0.35)', label: 'L', transform: 'translateY(-4px)' };
    if (isRight) return { bg: 'rgba(239,68,68,0.3)',   border: '#f87171', text: '#fff', shadow: '0 4px 14px rgba(239,68,68,0.35)', label: 'R', transform: 'translateY(-4px)' };
    if (isJ)     return { bg: 'rgba(59,130,246,0.3)',  border: '#60a5fa', text: '#fff', shadow: '0 4px 14px rgba(59,130,246,0.35)', label: idx === j ? 'j' : 'j+1', transform: 'translateY(-4px)' };
    if (isI)     return { bg: 'rgba(139,92,246,0.3)',  border: '#a78bfa', text: '#fff', shadow: '0 4px 14px rgba(139,92,246,0.35)', label: 'i', transform: 'translateY(-2px)' };
    return        { bg: 'rgba(30,41,59,0.7)',          border: 'rgba(71,85,105,0.5)', text: '#cbd5e1', shadow: 'none', label: null, transform: 'none' };
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(148,163,184,0.1)' }}>
      <div className="flex items-center gap-2 mb-4">
        <List size={13} style={{ color: '#fb923c' }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#fb923c' }}>Array Visualizer</span>
        <span className="text-xs font-mono ml-1 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(249,115,22,0.1)', color: 'rgba(253,186,116,0.7)', border: '1px solid rgba(249,115,22,0.2)', fontFamily: MONO }}>
          arr[{arr.length}]
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center pb-2">
        {arr.slice(0, MAX).map((val, idx) => {
          const s = getCellStyle(idx);
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 flex items-center justify-center text-sm font-bold rounded-xl border-2 transition-all duration-300"
                style={{ background: s.bg, borderColor: s.border, color: s.text, boxShadow: s.shadow, transform: s.transform, fontFamily: MONO }}>
                {val}
              </div>
              <span className="text-[9px] font-mono" style={{ color: 'rgba(148,163,184,0.35)', fontFamily: MONO }}>{idx}</span>
              {s.label && (
                <span className="text-[10px] font-bold" style={{ color: '#fbbf24' }}>{s.label}</span>
              )}
            </div>
          );
        })}
        {arr.length > MAX && (
          <span className="text-xs self-end mb-3" style={{ color: 'rgba(148,163,184,0.4)' }}>+{arr.length - MAX} more</span>
        )}
      </div>
    </div>
  );
}

/* ─── ScalarVisualizer ────────────────────────────────────────────────────── */
export function ScalarVisualizer({ vars }) {
  if (!vars) return null;
  const scalars = Object.entries(vars).filter(([k, v]) =>
    (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean')
    && !['arr', 'i', 'j', 'series'].includes(k)
  );
  if (scalars.length === 0) return null;

  const getScalarStyle = (v) => {
    if (typeof v === 'boolean') return { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)', text: '#d8b4fe', label: 'rgba(168,85,247,0.7)' };
    if (typeof v === 'string')  return { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  text: '#86efac', label: 'rgba(34,197,94,0.7)' };
    return                             { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)', text: '#f9a8d4', label: 'rgba(236,72,153,0.65)' };
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(148,163,184,0.1)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Binary size={13} style={{ color: '#f472b6' }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#f472b6' }}>Variable State</span>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {scalars.map(([k, v]) => {
          const s = getScalarStyle(v);
          return (
            <div key={k} className="flex flex-col items-center gap-2">
              <div className="min-w-[3rem] h-12 px-3 flex items-center justify-center text-lg font-bold rounded-xl border-2 transition-all duration-300"
                style={{ background: s.bg, borderColor: s.border, color: s.text, fontFamily: MONO, boxShadow: `0 4px 12px rgba(0,0,0,0.2)` }}>
                {String(v)}
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: s.label, fontFamily: MONO, border: `1px solid rgba(255,255,255,0.06)` }}>
                {k}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
