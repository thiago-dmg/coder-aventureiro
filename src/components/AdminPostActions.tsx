'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

type Props = {
  postId: number;
};

export default function AdminPostActions({ postId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onDelete() {
    const confirmed = window.confirm('Tem certeza que deseja remover este post?');
    if (!confirmed) return;

    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/posts/${postId}`, { method: 'DELETE' });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || 'Não foi possível remover o post.');
        }

        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro inesperado ao remover post.';
        setError(message);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/admin/posts/${postId}`} className="text-accent hover:underline">
        Editar
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="text-red-600 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? 'Removendo...' : 'Excluir'}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}
