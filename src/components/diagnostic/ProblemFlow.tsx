'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  X, 
  Loader2, 
  Check, 
  HelpCircle, 
  BookOpen, 
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface DiagnosticQuestion {
  id: number;
  question: string;
  options: Record<string, string>;
}

interface DiagnosticData {
  refined_problem_statement: string;
  diagnostic_questions: DiagnosticQuestion[];
}

interface SolutionData {
  action_item: string;
  avoid_item: string;
  root_cause_analysis: string;
  progression_warning: string;
  psycho_biological_view: string;
  philosophical_morality_view: string;
  literary_quote_advice: string;
  truth_seeking_questions: string[];
  book_mastery_law: string;
}

export default function ProblemFlow() {
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<number, string[]>>({});
  const [currentDiagStep, setCurrentDiagStep] = useState(0);
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const handleSubmitProblem = async () => {
    if (!problemText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemText }),
      });
      const data = await res.json();
      setDiagnosticData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagOptionClick = (questionId: number, optionKey: string) => {
    setDiagnosticAnswers((prev) => {
      const currentSelection = prev[questionId] || [];
      if (currentSelection.includes(optionKey)) {
        return {
          ...prev,
          [questionId]: currentSelection.filter((key) => key !== optionKey),
        };
      } else {
        return {
          ...prev,
          [questionId]: [...currentSelection, optionKey],
        };
      }
    });
  };

  const handleNextDiag = async () => {
    if (currentDiagStep < (diagnosticData?.diagnostic_questions.length || 0) - 1) {
      setCurrentDiagStep(currentDiagStep + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch('/api/problem/solution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemText,
            refinedProblem: diagnosticData?.refined_problem_statement,
            diagnosticAnswers,
            diagnosticQuestions: diagnosticData?.diagnostic_questions
          }),
        });
        const data = await res.json();
        setSolution(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // 1. FINAL ACTION PLAN / SOLUTION VIEW
  if (solution) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans animate-in fade-in duration-300">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Top Bar / Header */}
          <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                <CheckCircle2 size={14} /> Analysis Complete
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Your Custom Action Plan
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                &ldquo;{diagnosticData?.refined_problem_statement}&rdquo;
              </p>
            </div>
            
            <button 
              onClick={() => {
                setSolution(null);
                setDiagnosticData(null);
                setProblemText('');
                setCurrentDiagStep(0);
                setDiagnosticAnswers({});
              }}
              className="w-full md:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw size={15} /> Start Over
            </button>
          </header>

          {/* Primary Strategy: Action vs Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Green Core Action Card */}
            <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  What You Should Do
                </h3>
                <Lightbulb size={18} className="text-emerald-600" />
              </div>
              <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 font-normal">
                {solution.action_item}
              </p>
              <button 
                onClick={() => setModalContent({ title: 'Recommended Strategy', content: solution.action_item })}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-1 font-semibold pt-2"
              >
                Read full strategy <ChevronRight size={14} />
              </button>
            </div>

            {/* Red Avoidance Card */}
            <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center pb-2 border-b border-rose-50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                  What to Avoid Doing
                </h3>
                <AlertTriangle size={18} className="text-rose-600" />
              </div>
              <p className="text-slate-700 text-sm leading-relaxed line-clamp-4 font-normal">
                {solution.avoid_item}
              </p>
              <button 
                onClick={() => setModalContent({ title: 'Things to Avoid', content: solution.avoid_item })}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors flex items-center gap-1 font-semibold pt-2"
              >
                Read full warnings <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Reflection & Key Principle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions to ask yourself */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle size={18} className="text-indigo-600" /> Questions for Self-Reflection
                </h3>
                <p className="text-xs text-slate-500 mt-1">Think deeply about these questions to break your current patterns:</p>
              </div>
              
              <div className="space-y-3">
                {solution.truth_seeking_questions?.map((question, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex gap-3 items-start">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-5 h-5 shrink-0 rounded-full flex items-center justify-center border border-indigo-100">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{question}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Rule / Principle */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                  Key Principle Focus
                </span>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={16} className="text-slate-500" /> 
                    {solution.book_mastery_law?.split(':')[0] || 'Behavioral Principle'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {solution.book_mastery_law?.split(':').slice(1).join(':').trim() || solution.book_mastery_law}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl text-xs leading-relaxed">
                <strong>Next Step:</strong> Try focusing heavily on applying this single principle over the next 3 days.
              </div>
            </div>
          </div>

          {/* Deep Insight Breakdowns */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Understanding the Root Dynamics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Why This Formed (Root Cause)', content: solution.root_cause_analysis },
                { label: 'The Long-Term Risk (If Left Unchecked)', content: solution.progression_warning },
                { label: 'Mind & Body Connection', content: solution.psycho_biological_view },
                { label: 'Mindset & Perspective Shift', content: solution.philosophical_morality_view },
              ].map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {item.label}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final Advice Quote */}
          <div className="p-5 bg-slate-900 text-slate-100 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold tracking-wider uppercase text-indigo-400 mb-1">Perspective Check</p>
            <p className="text-sm italic leading-relaxed text-slate-300">
              {solution.literary_quote_advice}
            </p>
          </div>

        </div>

        {/* Global Expanded View Modal */}
        {modalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl max-h-[90vh] flex flex-col">
              <button 
                onClick={() => setModalContent(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
              <h3 className="text-lg font-bold text-slate-900 mb-3 pr-8">{modalContent.title}</h3>
              <div className="text-slate-600 text-sm leading-relaxed overflow-y-auto pr-2 space-y-3">
                {modalContent.content}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. DIAGNOSTIC MCQS VIEW
  if (diagnosticData) {
    const q = diagnosticData.diagnostic_questions[currentDiagStep];
    const currentSelections = diagnosticAnswers[q.id] || [];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 flex items-center justify-center font-sans animate-in fade-in duration-200">
        <div className="max-w-xl w-full bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-indigo-600">
              <span className="bg-indigo-50 px-2 py-0.5 rounded">Helping Us Understand</span>
              <span className="text-slate-400">Step {currentDiagStep + 1} of {diagnosticData.diagnostic_questions.length}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug pt-1">
              {q.question}
            </h3>
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
              Select all options that sound similar to what you are experiencing.
            </p>
          </div>

          <div className="space-y-2.5">
            {Object.entries(q.options).map(([key, text]) => {
              const isSelected = currentSelections.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => handleDiagOptionClick(q.id, key)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                    isSelected
                      ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className={cn(
                      "text-xs font-bold w-5 h-5 flex items-center justify-center rounded transition-colors",
                      isSelected 
                        ? "bg-indigo-600 text-white" 
                        : "bg-slate-100 border border-slate-200 text-slate-500 group-hover:bg-slate-200"
                    )}>
                      {key}
                    </span>
                    <span className="text-sm font-medium">{text}</span>
                  </div>
                  {isSelected && <Check size={15} className="text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextDiag}
            disabled={currentSelections.length === 0 || loading}
            className="w-full py-3 bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : currentDiagStep === diagnosticData.diagnostic_questions.length - 1 ? (
              'See My Action Plan'
            ) : (
              <span>Continue</span>
            )}
            {!loading && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    );
  }

  // 3. INITIAL PROBLEM INPUT VIEW (CLEAN, FRIENDLY INTRO)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-2xl space-y-6 text-center md:text-left animate-in fade-in duration-300">
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Let&apos;s Solve Your Problem Together!
          </h1>
          <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
            Tell us about the challenge, roadblock, or habit loop you are struggling with right now. We will guide you through a step-by-step breakdown to pinpoint the issue and find a real fix.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all text-left">
          <textarea
            disabled={loading}
            className="w-full h-44 bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none resize-none leading-relaxed"
            placeholder="Type your challenge here. Feel free to explain it in your own words without filtering..."
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
          />
        </div>

        <button
          disabled={loading || !problemText.trim()}
          onClick={handleSubmitProblem}
          className="w-full py-3.5 bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Analyzing your response...</span>
            </>
          ) : (
            <>
              <span>Let&apos;s Break it Down</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}