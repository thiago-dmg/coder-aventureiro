import Link from 'next/link';
import Pagination from '@/components/Pagination';
import AdminPostActions from '@/components/AdminPostActions';
import { listAllPostsForAdminPaged } from '@/lib/posts';

export const dynamic = 'force-dynamic';

const PER_PAGE = 10;

type Props = {
  // No Next 15, searchParams chega como Promise dentro de Server Components.
  searchParams: Promise<{ page?: string; q?: string }>;
};

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default async function AdminDashboard({ searchParams }: Props) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = (sp.q ?? '').trim();

  const paged = await listAllPostsForAdminPaged({ page, perPage: PER_PAGE, q });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>

        {/*
          Busca server-side: form com method=GET. Submeter envia ?q=... pra /admin
          e a página renderiza com o filtro aplicado. Sem JS no cliente, dá pra usar
          até com JS desabilitado.
        */}
        <form
          action="/admin"
          method="GET"
          className="flex items-center gap-2"
          role="search"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título, slug ou tag..."
            aria-label="Buscar posts"
            className="px-3 py-2 rounded-md border border-ink-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-md bg-accent text-white text-sm hover:bg-accent/90"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/admin"
              className="text-sm text-ink-500 hover:underline"
              aria-label="Limpar busca"
            >
              Limpar
            </Link>
          )}
        </form>
      </div>

      {q && (
        <p className="text-sm text-ink-500 mb-4">
          {paged.total === 0
            ? <>Nenhum post encontrado para <span className="font-mono">&quot;{q}&quot;</span>.</>
            : <>{paged.total} {paged.total === 1 ? 'resultado' : 'resultados'} para <span className="font-mono">&quot;{q}&quot;</span>.</>}
        </p>
      )}

      {paged.items.length === 0 ? (
        <div className="border border-dashed border-ink-200 rounded-lg p-8 text-center">
          {q ? (
            <p className="text-ink-500">Nada bate com a busca.</p>
          ) : (
            <>
              <p className="text-ink-500">Nenhum post ainda.</p>
              <Link
                href="/admin/posts/novo"
                className="mt-3 inline-block text-accent hover:underline"
              >
                Criar primeiro post
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left border-b border-ink-200 text-ink-500">
                <tr>
                  <th className="py-2 pr-4">Título</th>
                  <th className="py-2 pr-4 hidden sm:table-cell">Status</th>
                  <th className="py-2 pr-4 hidden md:table-cell">Atualizado</th>
                  <th className="py-2 pr-4 hidden lg:table-cell">Publicado em</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {paged.items.map((p) => (
                  <tr key={p.id} className="border-b border-ink-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-ink-500 font-mono">/{p.slug}</p>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      {p.published ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                          publicado
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-ink-100 text-ink-700 text-xs">
                          rascunho
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell text-ink-700">
                      {formatDate(p.updatedAt)}
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell text-ink-700">
                      {formatDate(p.publishedAt)}
                    </td>
                    <td className="py-3">
                      <AdminPostActions postId={p.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            total={paged.total}
            basePath="/admin"
            extraQuery={{ q: q || undefined }}
          />
        </>
      )}
    </div>
  );
}
