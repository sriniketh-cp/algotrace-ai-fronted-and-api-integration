import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, Loader2,
  HelpCircle, Trash2, ChevronRight, Activity, Terminal, Flame, Brain
} from 'lucide-react';

const MONO = "'JetBrains Mono','Fira Code',monospace";

const SUGGESTED_QUESTIONS = [
  "Why did the loop run this specific number of times?",
  "At what step did the array become fully sorted?",
  "What is the exact worst-case scenario for this algorithm?",
  "Could this be implemented with recursion or dynamic programming?",
  "What happens if all array values are identical?",
];

export function AlgoTutorDrawer({
  isOpen,
  onClose,
  messages = [],
  isTyping = false,
  onSendMessage,
  onClearMessages,
  currentStep = 0,
  totalSteps = 0,
  activeStep = null,
  hasRun = false
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleChipClick = (question) => {
    if (isTyping) return;
    onSendMessage(question);
  };

  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 flex flex-col animate-slide-in-right"
      style={{
        width: '460px',
        background: 'rgba(10,14,26,0.97)',
        borderLeft: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5), -4px 0 0 rgba(139,92,246,0.08)',
        backdropFilter: 'blur(20px)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 shrink-0 border-b"
        style={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 16px rgba(139,92,246,0.4)' }}>
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-tight">AlgoTutor Copilot</h3>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.35)' }}>
                AI
              </span>
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(148,163,184,0.5)' }}>
              Context-aware execution assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={onClearMessages} title="Clear chat history"
              className="p-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{ color: 'rgba(148,163,184,0.4)', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.4)'; e.currentTarget.style.background = 'transparent'; }}>
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={onClose} title="Close"
            className="p-2 rounded-lg cursor-pointer transition-all duration-150"
            style={{ color: 'rgba(148,163,184,0.5)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; e.currentTarget.style.background = 'transparent'; }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Telemetry Status Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b"
        style={{ borderColor: 'rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}>
        <div className="flex items-center gap-2 text-xs">
          <Activity size={11} style={{ color: '#8b5cf6' }} className="animate-pulse" />
          {hasRun && totalSteps > 0 ? (
            <span style={{ color: 'rgba(196,181,253,0.8)' }}>
              Synced: <strong style={{ color: '#c4b5fd' }}>Step {currentStep + 1}</strong>
              <span style={{ color: 'rgba(148,163,184,0.4)' }}> / {totalSteps}</span>
              {activeStep && <span style={{ color: 'rgba(148,163,184,0.4)' }}> · Line {activeStep.line}</span>}
            </span>
          ) : (
            <span style={{ color: 'rgba(148,163,184,0.4)' }}>Run trace to sync live telemetry</span>
          )}
        </div>
        {activeStep?.event && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)', fontFamily: MONO }}>
            {activeStep.event}
          </span>
        )}
      </div>

      {/* ── Messages Area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-4 space-y-5 animate-fade-in">
            {/* Welcome State */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(79,70,229,0.2))', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 24px rgba(139,92,246,0.15)' }}>
                <Brain size={26} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Ask AlgoTutor Anything</h4>
                <p className="text-xs leading-relaxed max-w-[300px] mx-auto" style={{ color: 'rgba(148,163,184,0.55)' }}>
                  I have access to every step, variable state, and loop iteration of your code execution.
                </p>
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest block"
                style={{ color: 'rgba(148,163,184,0.4)' }}>
                Suggested Questions
              </span>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button key={idx} onClick={() => handleChipClick(q)} disabled={isTyping}
                    className="flex items-center justify-between text-left px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.08)', color: 'rgba(203,213,225,0.8)' }}
                    onMouseEnter={e => { if (!isTyping) { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.08)'; }}>
                    <span className="leading-snug">{q}</span>
                    <ChevronRight size={13} className="shrink-0 ml-2 transition-colors"
                      style={{ color: 'rgba(148,163,184,0.3)' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {/* AI Avatar */}
                {msg.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <Bot size={14} style={{ color: '#a78bfa' }} />
                  </div>
                )}

                <div className="max-w-[85%] space-y-1">
                  {/* Sender label */}
                  <div className={`text-[10px] font-semibold ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                    style={{ color: msg.sender === 'user' ? 'rgba(147,197,253,0.6)' : 'rgba(167,139,250,0.6)' }}>
                    {msg.sender === 'user' ? 'You' : '✦ AlgoTutor'}
                  </div>

                  {/* Bubble */}
                  <div className="rounded-2xl px-4 py-2.5 text-[12px] leading-relaxed"
                    style={msg.sender === 'user' ? {
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      color: '#e2e8f0',
                      border: '1px solid rgba(148,163,184,0.1)',
                    }}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.timestamp && (
                      <div className="text-[9px] mt-1.5"
                        style={{ color: msg.sender === 'user' ? 'rgba(255,255,255,0.45)' : 'rgba(148,163,184,0.35)', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <User size={14} style={{ color: '#93c5fd' }} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <Bot size={14} style={{ color: '#a78bfa' }} />
                </div>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.1)' }}>
                  <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
                  <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
                  <span className="typing-dot w-2 h-2 rounded-full" style={{ background: '#8b5cf6' }} />
                  <span className="ml-1.5 text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>Analyzing trace…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Quick Chips (when chat has messages) ─────────────────────────────── */}
      {messages.length > 0 && (
        <div className="px-3 pb-2 border-t shrink-0 overflow-x-auto"
          style={{ borderColor: 'rgba(148,163,184,0.08)', scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase shrink-0" style={{ color: 'rgba(148,163,184,0.35)' }}>Ask:</span>
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
              <button key={i} onClick={() => handleChipClick(q)} disabled={isTyping}
                className="shrink-0 text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 disabled:opacity-40"
                style={{ background: 'rgba(148,163,184,0.06)', color: 'rgba(203,213,225,0.6)', border: '1px solid rgba(148,163,184,0.1)' }}
                onMouseEnter={e => { if (!isTyping) { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.06)'; e.currentTarget.style.color = 'rgba(203,213,225,0.6)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; }}>
                {q.length > 40 ? q.slice(0, 37) + '…' : q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 shrink-0 border-t" style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Ask about this execution…"
            disabled={isTyping}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs outline-none transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(148,163,184,0.12)',
              color: '#e2e8f0',
              fontFamily: "'Inter',sans-serif",
              caretColor: '#a78bfa',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.45)'; e.target.style.boxShadow = '0 0 0 2px rgba(139,92,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.12)'; e.target.style.boxShadow = 'none'; }}
          />
          <button type="submit" disabled={!inputText.trim() || isTyping}
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.5)'; }}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.3)'}>
            {isTyping
              ? <Loader2 size={15} className="text-white animate-spin" />
              : <Send size={15} className="text-white" />}
          </button>
        </form>
      </div>
    </aside>
  );
}
