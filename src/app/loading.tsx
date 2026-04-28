import PostCardSkeleton from '@/components/PostCardSkeleton';

/**
 * Fallback automático que o Next.js exibe enquanto a home carrega.
 * Cobre também navegações entre páginas (ex: ?page=2) — o Next mostra
 * esse loading durante a transição.
 */
export default function HomeLoading() {
  return (
    <div>
      <section className="mb-10">
        <div className="h-10 w-72 bg-ink-100 rounded animate-pulse" />
        <div className="mt-4 h-4 w-full max-w-xl bg-ink-100 rounded animate-pulse" />
        <div className="mt-2 h-4 w-3/4 max-w-xl bg-ink-100 rounded animate-pulse" />
      </section>

      <section className="mb-8">
        <div className="h-4 w-32 bg-ink-100 rounded animate-pulse mb-2" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-ink-100 rounded-full animate-pulse" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </section>
    </div>
  );
}
