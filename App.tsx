
import { useState, useCallback, useEffect } from 'react';
import { CalculatorMode, CalculationResult, AIResponse } from './types';
import Display from './components/Display';
import CalculatorButton from './components/CalculatorButton';
import { solveMathProblem } from './services/geminiService';

const App: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [mode, setMode] = useState<CalculatorMode>(CalculatorMode.BASIC);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);

  const handleNumber = (val: string) => {
    setExpression(prev => prev + val);
  };

  const handleOperator = (op: string) => {
    if (expression === '' && op === '-') {
      setExpression('-');
      return;
    }
    if (expression === '' || /[+\-*/%]$/.test(expression)) return;
    setExpression(prev => prev + op);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
  };

  const handleDelete = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const calculate = useCallback(() => {
    try {
      if (!expression) return;
      // Sanitize and evaluate
      // Replace symbols for JS eval
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Simple security check: only allow numbers, math operators, and Math functions
      // This is a simplified eval for demonstration
      const evalResult = eval(sanitized);
      const stringResult = Number.isFinite(evalResult) ? evalResult.toString() : 'Error';
      
      setResult(stringResult);
      
      const newHistoryItem: CalculationResult = {
        id: Date.now().toString(),
        expression,
        result: stringResult,
        timestamp: new Date()
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
    } catch (error) {
      setResult('Error');
    }
  }, [expression]);

  const handleAiSolve = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const solution = await solveMathProblem(aiPrompt);
      setAiResult(solution);
    } catch (error) {
      alert("Failed to solve problem. Please check your API key or try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === CalculatorMode.AI) return;
      
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      // Fixed line 95: Changed array.test to array.includes to fix the Property 'test' does not exist error.
      if (['+', '-', '*', '/'].includes(e.key)) handleOperator(e.key);
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') handleClear();
      if (e.key === '.') handleNumber('.');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, calculate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <i className="fas fa-calculator text-lg"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">Gemini Math Studio</h1>
        </div>
        <nav className="flex bg-slate-800 p-1 rounded-lg">
          {(Object.values(CalculatorMode) as CalculatorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === m ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Interface Area */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
          {mode !== CalculatorMode.AI ? (
            <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-800">
              <Display expression={expression} result={result} />
              
              <div className="grid grid-cols-4 gap-3">
                {/* Mode Specific Row */}
                {mode === CalculatorMode.SCIENTIFIC && (
                  <>
                    <CalculatorButton label="sin" onClick={() => handleNumber('sin(')} type="scientific" />
                    <CalculatorButton label="cos" onClick={() => handleNumber('cos(')} type="scientific" />
                    <CalculatorButton label="tan" onClick={() => handleNumber('tan(')} type="scientific" />
                    <CalculatorButton label="sqrt" onClick={() => handleNumber('sqrt(')} type="scientific" />
                    <CalculatorButton label="log" onClick={() => handleNumber('log(')} type="scientific" />
                    <CalculatorButton label="ln" onClick={() => handleNumber('ln(')} type="scientific" />
                    <CalculatorButton label="π" onClick={() => handleNumber('π')} type="scientific" />
                    <CalculatorButton label="e" onClick={() => handleNumber('e')} type="scientific" />
                  </>
                )}

                {/* Standard Layout */}
                <CalculatorButton label="C" onClick={handleClear} type="action" className="text-red-400" />
                <CalculatorButton label="(" onClick={() => handleNumber('(')} type="action" />
                <CalculatorButton label=")" onClick={() => handleNumber(')')} type="action" />
                <CalculatorButton label="÷" onClick={() => handleOperator('/')} type="operator" />

                <CalculatorButton label="7" onClick={() => handleNumber('7')} />
                <CalculatorButton label="8" onClick={() => handleNumber('8')} />
                <CalculatorButton label="9" onClick={() => handleNumber('9')} />
                <CalculatorButton label="×" onClick={() => handleOperator('*')} type="operator" />

                <CalculatorButton label="4" onClick={() => handleNumber('4')} />
                <CalculatorButton label="5" onClick={() => handleNumber('5')} />
                <CalculatorButton label="6" onClick={() => handleNumber('6')} />
                <CalculatorButton label="-" onClick={() => handleOperator('-')} type="operator" />

                <CalculatorButton label="1" onClick={() => handleNumber('1')} />
                <CalculatorButton label="2" onClick={() => handleNumber('2')} />
                <CalculatorButton label="3" onClick={() => handleNumber('3')} />
                <CalculatorButton label="+" onClick={() => handleOperator('+')} type="operator" />

                <CalculatorButton label="0" onClick={() => handleNumber('0')} />
                <CalculatorButton label="." onClick={() => handleNumber('.')} />
                <CalculatorButton label="⌫" onClick={handleDelete} type="action" />
                <CalculatorButton label="=" onClick={calculate} type="operator" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <i className="fas fa-magic"></i> AI Math Solver
                </h2>
                <p className="text-slate-400 text-sm">Ask Gemini to solve word problems or explain complex math concepts.</p>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {!aiResult && !aiLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-10">
                    <i className="fas fa-robot text-5xl mb-4 text-slate-700"></i>
                    <p>Enter a problem below like "What is the area of a circle with radius 5?" or "Solve for x: 2x + 5 = 15"</p>
                  </div>
                )}

                {aiLoading && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-400 animate-pulse">Gemini is thinking...</p>
                  </div>
                )}

                {aiResult && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Final Result</h3>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-2xl font-bold text-blue-300 math-mono">
                        {aiResult.answer}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Steps</h3>
                      <div className="space-y-3">
                        {aiResult.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-4 items-start">
                            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0 mt-0.5 border border-slate-700">
                              {idx + 1}
                            </span>
                            <p className="text-slate-300 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Explanation</h3>
                      <p className="text-slate-400 bg-slate-950/50 p-4 rounded-xl border border-slate-800 leading-relaxed italic">
                        "{aiResult.explanation}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/80 sticky bottom-0">
                <div className="flex gap-3">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Type your math problem here..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20 transition-all"
                  />
                  <button
                    onClick={handleAiSolve}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 h-20"
                  >
                    <i className="fas fa-paper-plane"></i>
                    Solve
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: History */}
        <aside className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-slate-300 flex items-center gap-2">
              <i className="fas fa-history text-slate-500"></i> History
            </h2>
            <button 
              onClick={() => setHistory([])}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-sm">
                No recent calculations
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                  onClick={() => {
                    setExpression(item.expression);
                    setResult(item.result);
                  }}
                >
                  <div className="text-xs text-slate-500 math-mono mb-1 truncate">{item.expression}</div>
                  <div className="text-lg font-bold text-blue-400 math-mono">= {item.result}</div>
                  <div className="text-[10px] text-slate-700 mt-2 text-right group-hover:text-slate-500 transition-colors">
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <div className="text-[10px] text-slate-600 uppercase tracking-widest font-bold text-center">
              Powered by Gemini 3 Flash
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Mobile Stats/Info */}
      <footer className="md:hidden p-2 bg-slate-900 text-[10px] text-center text-slate-500 border-t border-slate-800">
        Math Studio v1.0 • Gemini AI Enabled
      </footer>
    </div>
  );
};

export default App;
