'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md space-y-8 border border-zinc-800 p-8 rounded-2xl bg-zinc-900/50 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-light tracking-tighter text-zinc-100 mb-2">Access Identity</h1>
          <p className="text-zinc-500 text-sm">Enter your credentials to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 ml-1">Username</label>
            <input
              type="text"
              required
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 text-black rounded-lg py-3 font-medium hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-zinc-500 text-sm">
          Not registered?{' '}
          <Link href="/register" className="text-zinc-300 hover:text-white transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
