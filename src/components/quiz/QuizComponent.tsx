'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_QUESTIONS } from './questions';
import { cn } from '@/lib/utils';

export default function QuizComponent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentQuestion = ONBOARDING_QUESTIONS[currentStep];

  const handleOptionClick = (optionId: string) => {
    const currentAnswers = answers[currentQuestion.id] || [];
    if (currentQuestion.multiSelect) {
      if (currentAnswers.includes(optionId)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: currentAnswers.filter((id) => id !== optionId),
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...currentAnswers, optionId],
        });
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [optionId],
      });
    }
  };

  const handleNext = async () => {
    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      setError(null); // Reset error state on new attempt
      
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });

        // 1. Extract detailed JSON data from response safely, even if it's a 500 error
        let backendErrorMessage = `Server error: ${res.status}`;
        try {
          const data = await res.json();
          if (data && (data.message || data.error)) {
            backendErrorMessage = data.message || data.error;
          }
        } catch {
          // Fallback if the server crashes completely without sending valid JSON
        }

        // 2. Reject non-200 responses with the true descriptive error message
        if (!res.ok) {
          throw new Error(backendErrorMessage);
        }

        // Successfully saved, route home
        router.push('/');
        router.refresh();
      } catch (err) {
        console.error("Submission failed:", err);
        // 3. Set the specific backend error message directly to the UI
        setError(err instanceof Error ? err.message : "Failed to save your analysis. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextDisabled = !answers[currentQuestion.id] || answers[currentQuestion.id].length === 0;

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Step {currentStep + 1} of 10</p>
          <h2 className="text-xl font-light text-zinc-100">{currentQuestion.question.split(': ')[0]}</h2>
        </div>
        <div className="text-zinc-600 text-sm font-mono">
          {Math.round(((currentStep + 1) / 10) * 100)}%
        </div>
      </div>

      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-zinc-100 h-full transition-all duration-500" 
          style={{ width: `${((currentStep + 1) / 10) * 100}%` }}
        />
      </div>

      <div className="space-y-4">
        <p className="text-zinc-400 text-lg leading-relaxed mb-6">
          {currentQuestion.question.split(': ').slice(1).join(': ')}
        </p>
        <div className="grid gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id]?.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200",
                  isSelected 
                    ? "bg-zinc-100 border-zinc-100 text-black" 
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold",
                    isSelected ? "border-black/20" : "border-zinc-700"
                  )}>
                    {option.id}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg text-center font-mono break-words">
          <strong>Error Details:</strong> {error}
        </div>
      )}

      <div className="flex justify-between pt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || loading}
          className="px-6 py-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-0"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isNextDisabled || loading}
          className="px-8 py-3 bg-zinc-100 text-black rounded-lg font-medium hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : currentStep === 9 ? 'Complete Analysis' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}