import Link from 'next/link';

type Props = {
  page: number;
  totalPages: number;
  /**
   * Caminho base sem query string.
   * Ex: '/' para a home; '/tags/angular' para uma listagem por tag.
   */
  basePath: string;
  /**
   * Texto opcional pra mostrar abaixo (ex: "Página 2 de 3, 30 posts").
   */
  total?: number;
};

/**
 * Server Component de paginação.
 * Renderiza ‹ anterior | números das páginas | próximo ›
 * Páginas distantes da atual são colapsadas em "…" para não poluir a UI.
 */
export default function Pagination({ page, totalPages, basePath, total }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  const pages = buildPagesWindow(page, totalPages);

  function href(p: number) {
    if (p === 1) return basePath;
    return `${basePath}?page=${p}`;
  }

  return (
    <nav
      aria-label="Paginação dos posts"
      className="mt-10 flex flex-col items-center gap-3"
    >
      <ul className="flex items-center gap-1 flex-wrap justify-center">
        <li>
          {prev ? (
            <Link
              href={href(prev)}
              className="px-3 py-2 rounded-md border border-ink-200 text-ink-700 text-sm hover:bg-ink-100"
              aria-label="Página anterior"
              rel="prev"
            >
              ‹ Anterior
            </Link>
          ) : (
            <span
              className="px-3 py-2 rounded-md border border-ink-200 text-ink-300 text-sm cursor-not-allowed"
              aria-disabled="true"
            >
              ‹ Anterior
            </span>
          )}
        </li>

        {pages.map((p, i) =>
          p === '…' ? (
            <li key={`gap-${i}`} aria-hidden="true">
              <span className="px-2 py-2 text-ink-500 text-sm select-none">…</span>
            </li>
          ) : (
            <li key={p}>
              {p === page ? (
                <span
                  aria-current="page"
                  className="px-3 py-2 rounded-md bg-accent text-white text-sm font-medium"
                >
                  {p}
                </span>
              ) : (
                <Link
                  href={href(p)}
                  className="px-3 py-2 rounded-md border border-ink-200 text-ink-700 text-sm hover:bg-ink-100"
                  aria-label={`Ir para página ${p}`}
                >
                  {p}
                </Link>
              )}
            </li>
          ),
        )}

        <li>
          {next ? (
            <Link
              href={href(next)}
              className="px-3 py-2 rounded-md border border-ink-200 text-ink-700 text-sm hover:bg-ink-100"
              aria-label="Próxima página"
              rel="next"
            >
              Próximo ›
            </Link>
          ) : (
            <span
              className="px-3 py-2 rounded-md border border-ink-200 text-ink-300 text-sm cursor-not-allowed"
              aria-disabled="true"
            >
              Próximo ›
            </span>
          )}
        </li>
      </ul>

      <p className="text-xs text-ink-500">
        Página {page} de {totalPages}
        {typeof total === 'number' ? ` · ${total} ${total === 1 ? 'post' : 'posts'}` : ''}
      </p>
    </nav>
  );
}

/**
 * Constrói uma janela de páginas para exibir, com elipses pra não poluir
 * quando o totalPages for grande.
 *
 * Ex: page=5, total=10 → [1, "…", 4, 5, 6, "…", 10]
 *     page=2, total=3  → [1, 2, 3]
 */
function buildPagesWindow(page: number, totalPages: number): (number | '…')[] {
  // Se for pouca página, mostra todas.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '…')[] = [];
  const showLeftGap = page > 4;
  const showRightGap = page < totalPages - 3;

  pages.push(1);

  if (showLeftGap) pages.push('…');

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (showRightGap) pages.push('…');

  pages.push(totalPages);

  return pages;
}
