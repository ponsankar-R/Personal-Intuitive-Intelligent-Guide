import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { query } from '@/lib/db';
import ProblemFlow from '@/components/diagnostic/ProblemFlow';
import { LogOut } from 'lucide-react';

export default async function HomePage() {
  const userId = await getSession();

  if (!userId) {
    redirect('/login');
  }

  const userResult = await query('SELECT identity_sentences, profile_name FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  if (!user || !user.identity_sentences || user.identity_sentences.length === 0) {
    redirect('/onboarding');
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500/10">
      {/* Top Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
          
          {/* Personal Caring Greeting */}
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              Welcome back 👋
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Take a deep breath. Let&apos;s work through whatever is making you feel stuck today.
            </p>
          </div>

          {/* Clean, Non-Aggressive Logout */}
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit" 
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-4 py-2 rounded-xl bg-white hover:bg-rose-50/40 transition-all shadow-sm flex items-center gap-2"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </form>
          
        </div>
      </header>

      {/* Main Diagnostic & Solutions Workspace */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <ProblemFlow />
      </div>
    </main>
  );
}