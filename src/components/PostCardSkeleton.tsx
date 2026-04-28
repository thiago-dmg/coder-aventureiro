/**
 * Esqueleto do PostCard pra usar em loading.tsx enquanto a rota carrega.
 * Mantém as mesmas dimensões do card real pra evitar "salto" de layout.
 */
export default function PostCardSkeleton() {
  return (
    <article className="border border-ink-200 rounded-xl overflow-hidden bg-white">
      <div className="h-48 w-full bg-ink-100 animate-pulse" />
      <div className="p-5">
        <div className="flex gap-1 mb-3">
          <div className="h-5 w-14 bg-ink-100 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-ink-100 rounded-full animate-pulse" />
        </div>
        <div className="h-6 w-4/5 bg-ink-100 rounded animate-pulse" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full bg-ink-100 rounded animate-pulse" />
          <div className="h-3 w-11/12 bg-ink-100 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-ink-100 rounded animate-pulse" />
        </div>
        <div className="mt-4 h-3 w-24 bg-ink-100 rounded animate-pulse" />
      </div>
    </article>
  );
}
