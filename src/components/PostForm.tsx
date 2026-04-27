'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownContent from './MarkdownContent';
import { generateSlug } from '@/lib/slug';

export type PostFormValues = {
  id?: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string;
  published: boolean;
};

type Props = {
  initial?: Partial<PostFormValues>;
  mode: 'create' | 'edit';
};

const empty: PostFormValues = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  tags: '',
  published: false,
};

export default function PostForm({ initial, mode }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>({ ...empty, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function onTitleChange(title: string) {
    update('title', title);
    // Sugere slug enquanto o usuário ainda não tocou no campo manualmente
    if (mode === 'create' && !values.slug) {
      update('slug', generateSlug(title));
    }
  }

  async function submit(publishedOverride?: boolean) {
    setError(null);
    const body = {
      ...values,
      slug: values.slug || generateSlug(values.title),
      published: publishedOverride ?? values.published,
    };

    if (!body.title || !body.summary || !body.content) {
      setError('Título, resumo e conteúdo são obrigatórios.');
      return;
    }

    const url =
      mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${initial?.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    startTransition(async () => {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Erro ao salvar.');
        return;
      }

      router.push('/admin');
      router.refresh();
    });
  }

  async function remove() {
    if (!initial?.id) return;
    if (!confirm('Excluir esse post? Essa ação não pode ser desfeita.')) return;

    startTransition(async () => {
      const res = await fetch(`/api/admin/posts/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Erro ao excluir.');
        return;
      }
      router.push('/admin');
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Field label="Título">
        <input
          required
          value={values.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputClass}
          placeholder="Como aprendi Signals no Angular"
        />
      </Field>

      <Field label="Slug (URL)" hint="Letras minúsculas, números e hífen.">
        <input
          value={values.slug}
          onChange={(e) => update('slug', e.target.value)}
          className={inputClass + ' font-mono'}
          placeholder="como-aprendi-signals-no-angular"
        />
      </Field>

      <Field label="Resumo" hint="1-2 frases. Aparece nos cards.">
        <textarea
          required
          rows={2}
          value={values.summary}
          onChange={(e) => update('summary', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Tags" hint="Separadas por vírgula. Ex: angular, signals, rxjs">
        <input
          value={values.tags}
          onChange={(e) => update('tags', e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Imagem de capa (URL — opcional)">
        <input
          type="url"
          value={values.coverImage}
          onChange={(e) => update('coverImage', e.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </Field>

      <Field
        label="Conteúdo (Markdown)"
        hint="Aceita markdown padrão + GFM (tabelas, checkboxes)."
      >
        <div className="flex gap-2 mb-2 text-xs">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={tabClass(!showPreview)}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={tabClass(showPreview)}
          >
            Preview
          </button>
        </div>

        {showPreview ? (
          <div className="border border-ink-200 rounded-md p-4 min-h-[400px] bg-white">
            {values.content ? (
              <MarkdownContent>{values.content}</MarkdownContent>
            ) : (
              <p className="text-ink-500 text-sm">Nada para mostrar ainda.</p>
            )}
          </div>
        ) : (
          <textarea
            required
            rows={18}
            value={values.content}
            onChange={(e) => update('content', e.target.value)}
            className={inputClass + ' font-mono text-sm'}
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-ink-200">
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={pending}
          className="px-4 py-2 rounded-md border border-ink-300 text-ink-700 hover:bg-ink-50 disabled:opacity-50"
        >
          Salvar rascunho
        </button>

        <button
          type="button"
          onClick={() => submit(true)}
          disabled={pending}
          className="px-4 py-2 rounded-md bg-accent hover:bg-accent-dark text-white disabled:opacity-50"
        >
          {values.published ? 'Atualizar publicação' : 'Publicar'}
        </button>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="ml-auto px-3 py-2 text-sm text-red-700 hover:underline"
          >
            Excluir post
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-md border border-ink-200 px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

function tabClass(active: boolean) {
  return `px-3 py-1 rounded-md ${
    active ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
  }`;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-500 mt-1">{hint}</span>}
    </label>
  );
}
