import QuizComponent from "@/components/quiz/QuizComponent";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl font-light tracking-tighter text-zinc-100">Identity Calibration</h1>
          <p className="text-zinc-500 max-w-lg mx-auto">
            To provide intuitive guidance, we must first understand the architecture of your decision-making and core values.
          </p>
        </div>
        <QuizComponent />
      </div>
    </div>
  );
}
