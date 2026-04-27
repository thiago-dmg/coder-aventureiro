'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function DeleteCommentButton({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove() {
    if (!confirm('Excluir esse comentário?')) return;
    start(async () => {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Erro ao excluir.');
      }
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="text-sm text-red-700 hover:underline disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
