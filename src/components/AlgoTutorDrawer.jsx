import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, Loader2,
  HelpCircle, Trash2, ChevronRight, Activity, Terminal, Flame
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Why did the loop run this specific number of times?",
  "At what step did the state/array become fully sorted?",
  "What is the exact worst-case scenario for this algorithm?",
  "Could this be implemented with recursion or dynamic programming?",
  "What happens if all array values are identical?"
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
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-[#0b0f1e]/98 border-l border-slate-800/80 shadow-2xl flex flex-col backdrop-blur-xl animate-slide-in-right"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">AlgoTutor Copilot</h3>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">AI Feature 4</span>
            </div>
            <p className="text-[11px] text-slate-400">Context-aware execution assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={onClearMessages}
              title="Clear chat history"
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            title="Close drawer"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="px-4 py-2 bg-violet-950/30 border-b border-violet-500/20 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2 text-violet-300">
          <Activity size={12} className="text-violet-400 animate-pulse" />
          <span>
            {hasRun && totalSteps > 0 ? (
              <>Telemetry synced: <strong className="text-violet-200">Step {currentStep + 1}</strong> of {totalSteps} {activeStep ? `(Line ${activeStep.line})` : ''}</>
            ) : (
              <span className="text-slate-400">Run trace to sync live step telemetry</span>
            )}
          </span>
        </div>
        {activeStep?.event && (
          <span className="font-mono text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
            {activeStep.event}
          </span>
        )}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {messages.length === 0 ? (
          <div className="py-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
                <Sparkles size={22} />
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Ask AlgoTutor anything about this run</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                AlgoTutor has access to every single step, variable state snapshot, and loop iteration of this code execution.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(q)}
                    disabled={isTyping}
                    className="flex items-center justify-between text-left text-xs text-slate-300 bg-slate-900/80 hover:bg-violet-950/40 border border-slate-800 hover:border-violet-500/40 p-2.5 rounded-xl transition-all duration-150 group cursor-pointer"
                  >
                    <span>{q}</span>
                    <ChevronRight size={13} className="text-slate-600 group-hover:text-violet-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-violet-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans space-y-1">
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <div
                      className={`text-[9px] mt-1.5 ${
                        msg.sender === 'user' ? 'text-blue-200/70 text-right' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-blue-300" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-violet-300" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin text-violet-400" />
                  <span className="text-xs text-slate-400">AlgoTutor is analyzing telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 shrink-0">
        {messages.length > 0 && (
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Ask:</span>
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
              <button
                key={i}
                onClick={() => handleChipClick(q)}
                disabled={isTyping}
                className="text-[10px] whitespace-nowrap bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Ask anything about this execution..."
            disabled={isTyping}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
          >
            {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </aside>
  );
}
