import PostCardSkeleton from '@/components/PostCardSkeleton';

export default function TagLoading() {
  return (
    <div>
      <div className="h-4 w-20 bg-ink-100 rounded animate-pulse" />
      <div className="mt-3 h-9 w-40 bg-ink-100 rounded animate-pulse" />
      <div className="mt-2 h-4 w-32 bg-ink-100 rounded animate-pulse" />

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </section>
    </div>
  );
}
