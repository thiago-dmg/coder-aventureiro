import Link from 'next/link';
import Image from 'next/image';
import TagBadge from './TagBadge';
import type { PostListItem } from '@/lib/posts';

/**
 * Altura fixa da imagem no card. Mesmo valor usado em loading/skeleton
 * para evitar "salto" de layout quando o card termina de carregar.
 */
const CARD_IMAGE_HEIGHT = '12rem'; // = h-48 (192px) — espelha skeleton

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function PostCard({ post }: { post: PostListItem }) {
  return (
    <article className="group flex flex-col h-full border border-ink-200 rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-md transition-all bg-white">
      {post.coverImage ? (
        <Link
          href={`/posts/${post.slug}`}
          className="relative block w-full bg-ink-100 overflow-hidden"
          style={{ height: CARD_IMAGE_HEIGHT }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </Link>
      ) : null}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.slice(0, 4).map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h2 className="text-xl font-semibold leading-snug group-hover:text-accent transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="mt-2 text-ink-700 text-sm leading-relaxed line-clamp-3">
          {post.summary}
        </p>

        <p className="mt-4 text-xs text-ink-500">{formatDate(post.publishedAt)}</p>
      </div>
    </article>
  );
}
