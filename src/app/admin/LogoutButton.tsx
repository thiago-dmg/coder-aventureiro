'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function logout() {
    start(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    });
  }

  return (
    <button
      onClick={logout}
      disabled={pending}
      className="text-sm text-ink-500 hover:text-ink-900"
    >
      Sair
    </button>
  );
}
