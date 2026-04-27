'use client';

import { useEffect, useState, useTransition } from 'react';

type Props = { slug: string };

export default function LikeButton({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [pending, start] = useTransition();

  // Busca contagem inicial
  useEffect(() => {
    let alive = true;
    fetch(`/api/posts/${encodeURIComponent(slug)}/like`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (typeof data.count === 'number') setCount(data.count);
        if (typeof data.liked === 'boolean') setLiked(data.liked);
      })
      .catch(() => {/* silencioso — botão funciona mesmo sem o GET */});
    return () => { alive = false; };
  }, [slug]);

  function toggleLike() {
    if (liked || pending) return; // já curtiu — não chama de novo
    start(async () => {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(true);
        if (typeof data.count === 'number') setCount(data.count);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={liked || pending}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors
        ${liked
          ? 'border-accent bg-accent/10 text-accent cursor-default'
          : 'border-ink-200 hover:border-accent/40 hover:bg-accent/5 text-ink-700'}
        disabled:opacity-60`}
    >
      <span aria-hidden>{liked ? '♥' : '♡'}</span>
      <span>{liked ? 'Você curtiu' : 'Curtir'}</span>
      {count !== null && (
        <span className="text-ink-500 font-normal">· {count}</span>
      )}
    </button>
  );
}
