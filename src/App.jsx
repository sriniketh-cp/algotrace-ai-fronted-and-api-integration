import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Square, SkipBack, SkipForward, Loader2 } from 'lucide-react';

const FALLBACK_TRACE = [
  { step: 1, line: 4, explanation: "Starting outer loop. i=0", variables: { arr: [5, 2, 8, 1], i: 0, j: 0 } },
  { step: 2, line: 5, explanation: "Comparing elements at index 0 and 1", variables: { arr: [5, 2, 8, 1], i: 0, j: 0 } },
  { step: 3, line: 6, explanation: "5 is greater than 2, swapping...", variables: { arr: [2, 5, 8, 1], i: 0, j: 0 } },
  { step: 4, line: 5, explanation: "Comparing elements at index 1 and 2", variables: { arr: [2, 5, 8, 1], i: 0, j: 1 } },
  { step: 5, line: 5, explanation: "5 is less than 8, no swap needed.", variables: { arr: [2, 5, 8, 1], i: 0, j: 1 } },
  { step: 6, line: 5, explanation: "Comparing elements at index 2 and 3", variables: { arr: [2, 5, 8, 1], i: 0, j: 2 } },
  { step: 7, line: 6, explanation: "8 is greater than 1, swapping...", variables: { arr: [2, 5, 1, 8], i: 0, j: 2 } },
];

export default function App() {
  const [code, setCode] = useState('# Paste your Python code here\n\narr = [5, 2, 8, 1]\nfor i in range(len(arr)):\n    for j in range(0, len(arr) - i - 1):\n        if arr[j] > arr[j + 1]:\n            arr[j], arr[j + 1] = arr[j + 1], arr[j]\n');
  const [steps, setSteps] = useState(FALLBACK_TRACE);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [complexity, setComplexity] = useState({
    time: "O(n^2)",
    space: "O(1)",
    summary: "Nested loop comparison with in-place swaps (Bubble Sort)."
  });

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => setCurrentStep((prev) => prev + 1), 1000);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps]);

  const handleRun = async () => {
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const traceResponse = await fetch("http://localhost:8000/trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!traceResponse.ok) {
        throw new Error("Python trace server unreachable");
      }

      const traceData = await traceResponse.json();
      if (traceData.status === "error") {
        throw new Error(traceData.message);
      }

      setSteps(traceData.steps);
      setCurrentStep(0);

      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (GROQ_API_KEY) {
        const llmResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{
              role: "user",
              content: `Analyze this Python code:\n${code}\nProvide the Time and Space Complexity, and a 1-sentence summary of what the code does. Return ONLY valid JSON format: {"time": "...", "space": "...", "summary": "..."}`
            }],
            response_format: { type: "json_object" }
          })
        });

        const llmData = await llmResponse.json();
        const parsedComplexity = JSON.parse(llmData.choices[0].message.content);
        setComplexity(parsedComplexity);
      }

    } catch (error) {
      console.warn("Backend not active, keeping mock trace:", error.message);
      if (!llmResponse.ok) {
           throw new Error(`Groq API error ${llmResponse.status}: ${await llmResponse.text()}`);
}
      alert("Notice: Could not reach http://localhost:8000. Running mock data for local testing.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeData = steps[currentStep] || FALLBACK_TRACE[0];
  // The visualizer only supports an array named `arr`; never render arbitrary values as one.
  const activeArr = Array.isArray(activeData.variables?.arr)
    ? activeData.variables.arr
    : [];
  const pointerJ = activeData.variables?.j;

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <div className="w-1/2 flex flex-col border-r border-gray-700">
        <div className="p-4 bg-gray-800 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">AlgoTrace AI</h1>
          <button 
            onClick={handleRun}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {isLoading ? "Analyzing..." : "Run Code"}
          </button>
        </div>
        <div className="flex-grow">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, readOnly: isPlaying }}
          />
        </div>
      </div>

      <div className="w-1/2 flex flex-col relative">
        <div className="bg-gray-800 p-4 border-b border-gray-700 min-h-[90px] flex flex-col justify-center">
          <p className="text-gray-200 text-base mb-1">
            <span className="font-bold text-blue-400">Step {activeData.step}:</span> {activeData.explanation || `Executing Line ${activeData.line}`}
          </p>
          <div className="flex gap-4 text-xs text-gray-400 mt-1">
            <span className="bg-gray-900 px-2 py-1 rounded border border-gray-700">Time: <span className="font-mono text-purple-400">{complexity.time}</span></span>
            <span className="bg-gray-900 px-2 py-1 rounded border border-gray-700">Space: <span className="font-mono text-purple-400">{complexity.space}</span></span>
            <span className="italic self-center text-gray-400 truncate">{complexity.summary}</span>
          </div>
        </div>

        <div className="flex-grow p-8 flex flex-col items-center justify-center bg-gray-950">
          <div className="flex gap-4">
            {activeArr.map((val, idx) => {
              const isActive = pointerJ !== undefined && (idx === pointerJ || idx === pointerJ + 1);

              return (
                <div 
                  key={idx} 
                  className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-900/60 border-blue-400 -translate-y-1 shadow-blue-500/20' 
                      : 'bg-gray-800 border-gray-700 text-gray-200'
                  }`}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-24 bg-gray-800 border-t border-gray-700 flex flex-col justify-center px-8">
          <div className="flex justify-center items-center gap-6">
            <button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              disabled={currentStep === 0}
            >
              <SkipBack size={24} />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-blue-400 hover:text-blue-300 transition-colors transform hover:scale-110 cursor-pointer"
            >
              {isPlaying ? <Square size={30} /> : <Play size={30} />}
            </button>
            <button 
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              disabled={currentStep === steps.length - 1}
            >
              <SkipForward size={24} />
            </button>
          </div>
          <div className="text-center text-xs text-gray-500 mt-2">
            Progress: {currentStep + 1} / {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}
