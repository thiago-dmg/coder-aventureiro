/**
 * Esqueleto da página individual de post.
 * Mostrado enquanto a rota busca o post pelo slug.
 */
export default function PostLoading() {
  return (
    <article>
      <header className="mb-6">
        <div className="flex gap-1 mb-3">
          <div className="h-5 w-14 bg-ink-100 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-ink-100 rounded-full animate-pulse" />
          <div className="h-5 w-20 bg-ink-100 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-3/4 bg-ink-100 rounded animate-pulse" />
        <div className="mt-3 h-5 w-full max-w-2xl bg-ink-100 rounded animate-pulse" />
        <div className="mt-2 h-4 w-40 bg-ink-100 rounded animate-pulse" />
      </header>

      <div className="relative h-64 sm:h-80 md:h-96 w-full mb-8 rounded-xl bg-ink-100 animate-pulse" />

      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-ink-100 rounded animate-pulse ${
              i % 4 === 3 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-ink-200 flex items-center gap-3">
        <div className="h-9 w-24 bg-ink-100 rounded-full animate-pulse" />
        <div className="h-3 w-64 bg-ink-100 rounded animate-pulse" />
      </div>
    </article>
  );
}
