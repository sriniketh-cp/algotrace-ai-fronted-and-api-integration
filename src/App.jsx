import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Square, SkipBack, SkipForward } from 'lucide-react';

// This simulates the exact JSON your teammate's Python API will return
const MOCK_TRACE = [
  { step: 1, line: 4, explanation: "Starting outer loop. i=0", variables: { arr: [5, 2, 8, 1] }, active_indices: [], action: "none" },
  { step: 2, line: 5, explanation: "Comparing elements at index 0 and 1", variables: { arr: [5, 2, 8, 1] }, active_indices: [0, 1], action: "compare" },
  { step: 3, line: 6, explanation: "5 is greater than 2, swapping...", variables: { arr: [2, 5, 8, 1] }, active_indices: [0, 1], action: "swap" },
  { step: 4, line: 5, explanation: "Comparing elements at index 1 and 2", variables: { arr: [2, 5, 8, 1] }, active_indices: [1, 2], action: "compare" },
  { step: 5, line: 5, explanation: "5 is less than 8, no swap needed.", variables: { arr: [2, 5, 8, 1] }, active_indices: [1, 2], action: "none" },
  { step: 6, line: 5, explanation: "Comparing elements at index 2 and 3", variables: { arr: [2, 5, 8, 1] }, active_indices: [2, 3], action: "compare" },
  { step: 7, line: 6, explanation: "8 is greater than 1, swapping...", variables: { arr: [2, 5, 1, 8] }, active_indices: [2, 3], action: "swap" },
];

export default function App() {
  const [code, setCode] = useState('# Paste your Python code here\n\narr = [5, 2, 8, 1]\nfor i in range(len(arr)):\n    for j in range(0, len(arr) - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]\n');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-play timer logic
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < MOCK_TRACE.length - 1) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), 1200);
    } else if (currentStep >= MOCK_TRACE.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const activeData = MOCK_TRACE[currentStep];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Left Pane: Code Editor */}
      <div className="w-1/2 flex flex-col border-r border-gray-700">
        <div className="p-4 bg-gray-800 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">AlgoTrace AI</h1>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
            <Play size={16} /> Run Code
          </button>
        </div>
        <div className="flex-grow">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val)}
            options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isPlaying }}
          />
        </div>
      </div>

      {/* Right Pane: Visualizer & Controls */}
      <div className="w-1/2 flex flex-col relative">
        {/* Dynamic Explanation Bar */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 min-h-[80px] flex items-center">
          <p className="text-gray-300">
            <span className="font-bold text-blue-400">Step {activeData.step}:</span> {activeData.explanation}
          </p>
        </div>

        {/* Visualizer Canvas Area */}
        <div className="flex-grow p-8 flex flex-col items-center justify-center bg-gray-950">
          <div className="flex gap-4">
            {activeData.variables.arr.map((val, idx) => {
              const isActive = activeData.active_indices.includes(idx);
              const isSwapping = isActive && activeData.action === "swap";
              
              // Dynamic CSS based on state
              let bgColor = "bg-gray-800";
              let borderColor = "border-gray-600";
              
              if (isSwapping) {
                bgColor = "bg-red-900/50";
                borderColor = "border-red-500";
              } else if (isActive) {
                bgColor = "bg-blue-900/50";
                borderColor = "border-blue-500";
              }

              return (
                <div 
                  key={idx} 
                  className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg border-2 transition-all duration-300 ${bgColor} ${borderColor} ${isSwapping ? '-translate-y-2' : ''}`}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>

        {/* Playback Toolbar */}
        <div className="h-24 bg-gray-800 border-t border-gray-700 flex flex-col justify-center px-8">
          <div className="flex justify-center items-center gap-6">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={currentStep === 0}
            >
              <SkipBack size={24} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-blue-400 hover:text-blue-300 transition-colors transform hover:scale-110"
            >
              {isPlaying ? <Square size={32} /> : <Play size={32} />}
            </button>
            <button 
              onClick={() => setCurrentStep(Math.min(MOCK_TRACE.length - 1, currentStep + 1))}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={currentStep === MOCK_TRACE.length - 1}
            >
              <SkipForward size={24} />
            </button>
          </div>
          <div className="text-center text-xs text-gray-500 mt-2">
            Progress: {currentStep + 1} / {MOCK_TRACE.length}
          </div>
        </div>
      </div>
    </div>
  );
}