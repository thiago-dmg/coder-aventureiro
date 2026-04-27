'use client';

import { useEffect, useState, useTransition } from 'react';

type Comment = {
  id: number;
  author: string;
  content: string;
  createdAt: string; // ISO
};

type Props = { slug: string };

const AUTHOR_MAX = 50;
const CONTENT_MAX = 2000;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function CommentSection({ slug }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    fetch(`/api/posts/${encodeURIComponent(slug)}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (alive && Array.isArray(data.comments)) setComments(data.comments);
      })
      .catch(() => alive && setComments([]));
    return () => { alive = false; };
  }, [slug]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (content.trim().length < 2) {
      setError('Escreve algo um pouquinho maior :)');
      return;
    }

    start(async () => {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content, website }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Erro ao enviar comentário.');
        return;
      }

      const data = await res.json();
      // honeypot retornou 200 sem criar — só limpa o form silenciosamente
      if (data.comment) {
        setComments((prev) => [data.comment, ...(prev ?? [])]);
      }
      setContent('');
      setAuthor('');
    });
  }

  return (
    <section className="mt-12 pt-8 border-t border-ink-200">
      <h2 className="text-xl font-semibold mb-4">Comentários</h2>

      <form onSubmit={submit} className="space-y-3 mb-8">
        {/* honeypot — escondido pra humanos, bots preenchem */}
        <div aria-hidden className="hidden" style={{ display: 'none' }}>
          <label>
            Deixe em branco se você for humano:
            <input
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <input
            type="text"
            placeholder="Seu nome (opcional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={AUTHOR_MAX}
            className="rounded-md border border-ink-200 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm"
          />
          <span className="text-xs text-ink-500 self-center hidden sm:block">
            sem login, sem email
          </span>
        </div>

        <textarea
          required
          rows={4}
          placeholder="Deixe um comentário..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={CONTENT_MAX}
          className="w-full rounded-md border border-ink-200 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-500">
            {content.length}/{CONTENT_MAX} · texto puro, sem HTML
          </span>
          <button
            type="submit"
            disabled={pending || content.trim().length < 2}
            className="px-4 py-2 rounded-md bg-accent hover:bg-accent-dark text-white text-sm disabled:opacity-50"
          >
            {pending ? 'Enviando...' : 'Comentar'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
      </form>

      {comments === null ? (
        <p className="text-sm text-ink-500">Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-500">Nenhum comentário ainda. Seja o primeiro!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="border border-ink-200 rounded-lg p-4 bg-white">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="font-medium text-ink-900">{c.author}</span>
                <span className="text-xs text-ink-500">{formatDate(c.createdAt)}</span>
              </div>
              {/*
                IMPORTANTE: usamos {c.content}, NÃO dangerouslySetInnerHTML.
                Assim o React escapa o conteúdo e não há risco de XSS.
                whitespace-pre-wrap mantém quebras de linha do usuário.
              */}
              <p className="text-ink-700 whitespace-pre-wrap break-words">
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
