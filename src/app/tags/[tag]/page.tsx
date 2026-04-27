import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { listPostsByTag } from '@/lib/posts';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = await listPostsByTag(decoded);

  return (
    <div>
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-3 text-3xl font-bold">#{decoded}</h1>
      <p className="mt-2 text-ink-700">
        {posts.length} {posts.length === 1 ? 'post' : 'posts'} com essa tag.
      </p>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      {posts.length === 0 && (
        <p className="mt-8 text-ink-500">Nenhum post com essa tag ainda.</p>
      )}
    </div>
  );
}
