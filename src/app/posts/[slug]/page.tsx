import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import MarkdownContent from '@/components/MarkdownContent';
import TagBadge from '@/components/TagBadge';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import { getPostBySlug } from '@/lib/posts';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post não encontrado' };
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

function formatDate(date: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article>
      <header className="mb-6">
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tagsArray.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="mt-3 text-ink-700">{post.summary}</p>
        <p className="mt-2 text-sm text-ink-500">
          Publicado em {formatDate(post.publishedAt)}
        </p>
      </header>

      {post.coverImage && (
        <div
          className="relative w-full mb-8 rounded-xl overflow-hidden bg-ink-100"
          style={{ height: "clamp(16rem, 40vw, 24rem)" }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <MarkdownContent>{post.content}</MarkdownContent>

      <div className="mt-10 pt-6 border-t border-ink-200 flex items-center gap-3">
        <LikeButton slug={post.slug} />
        <span className="text-sm text-ink-500">
          Gostou? Deixa um curtir aí 👇 (e comenta abaixo)
        </span>
      </div>

      <CommentSection slug={post.slug} />
    </article>
  );
}
