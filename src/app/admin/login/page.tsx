'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    start(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Login falhou.');
        return;
      }

      const next = params.get('next') || '/admin';
      router.push(next);
      router.refresh();
    });
  }

  return (
    <div className="max-w-sm mx-auto mt-12 border border-ink-200 rounded-xl p-6 bg-white">
      <h1 className="text-xl font-semibold mb-1">Entrar no admin</h1>
      <p className="text-sm text-ink-500 mb-6">
        Use o usuário e senha definidos no <code>.env</code>.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink-700 mb-1">Usuário</span>
          <input
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-ink-200 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-ink-700 mb-1">Senha</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-ink-200 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent hover:bg-accent-dark text-white py-2 disabled:opacity-50"
        >
          {pending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
