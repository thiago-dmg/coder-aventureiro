import Link from 'next/link';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { listPublishedPostsPaged, getAllTags } from '@/lib/posts';

// Server Component: dados são buscados no servidor a cada request.
// Para cachear, podemos usar revalidate. Por enquanto, sempre fresh.
export const dynamic = 'force-dynamic';

const PER_PAGE = 10;
const MAX_TAGS = 12;

/**
 * Tags que sempre aparecem na seção "Tags populares", mesmo se tiverem
 * pouco uso. Útil pra destacar categorias importantes (ex: "projetos")
 * que não competem em volume com tags técnicas (ex: "angular", "devops").
 *
 * Ordem aqui é a ordem de exibição. As demais slots são preenchidas
 * pelas tags mais usadas, até completar MAX_TAGS no total.
 */
const FEATURED_TAGS = ['projetos'];

// No Next 15, searchParams chega como Promise dentro de Server Components.
type Props = {
  searchParams: Promise<{ page?: string }>;
};

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parsePage(sp.page);

  const [paged, tags] = await Promise.all([
    listPublishedPostsPaged({ page, perPage: PER_PAGE }),
    getAllTags(),
  ]);

  // Lista exibida: tags fixas primeiro (na ordem de FEATURED_TAGS), depois
  // as mais usadas que ainda não estão na lista, até completar MAX_TAGS.
  // Tags fixas que não existem no banco são ignoradas silenciosamente.
  const featured = FEATURED_TAGS
    .map((name) => tags.find((t) => t.tag === name))
    .filter((t): t is NonNullable<typeof t> => t != null);
  const featuredNames = new Set(featured.map((t) => t.tag));
  const rest = tags.filter((t) => !featuredNames.has(t.tag));
  const displayedTags = [...featured, ...rest].slice(0, MAX_TAGS);

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Coder Aventureiro
        </h1>
        <p className="mt-3 text-ink-700 max-w-xl">
          Diário de bordo de um dev front-end. Projetos, bugs resolvidos,
          estudos e tudo que aprendi (e re-aprendi) pelo caminho.
        </p>
      </section>

      {displayedTags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-ink-700 mb-2">Tags populares</h2>
          <div className="flex flex-wrap gap-2">
            {displayedTags.map(({ tag, count }) => (
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
        {paged.items.length === 0 && (
          <p className="text-ink-500">Nenhum post publicado ainda.</p>
        )}
        {paged.items.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      <Pagination
        page={paged.page}
        totalPages={paged.totalPages}
        total={paged.total}
        basePath="/"
      />
    </div>
  );
}
