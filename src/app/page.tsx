import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { listPublishedPosts, getAllTags } from '@/lib/posts';

// Server Component: dados são buscados no servidor a cada request.
// Para cachear, podemos usar revalidate. Por enquanto, sempre fresh.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [posts, tags] = await Promise.all([listPublishedPosts(), getAllTags()]);

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Code Aventureiro
        </h1>
        <p className="mt-3 text-ink-700 max-w-xl">
          Diário de bordo de um dev front-end. Projetos, bugs resolvidos,
          estudos e tudo que aprendi (e re-aprendi) pelo caminho.
        </p>
      </section>

      {tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-ink-700 mb-2">Tags populares</h2>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 12).map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-1 rounded-full bg-ink-100 text-ink-700 hover:bg-accent/10 hover:text-accent"
              >
                #{tag} <span className="text-ink-500">({count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 sm:grid-cols-2">
        {posts.length === 0 && (
          <p className="text-ink-500">Nenhum post publicado ainda.</p>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>
    </div>
  );
}
