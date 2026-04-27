import Link from 'next/link';
import { listAllPostsForAdmin } from '@/lib/posts';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default async function AdminDashboard() {
  const posts = await listAllPostsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Posts</h1>

      {posts.length === 0 ? (
        <div className="border border-dashed border-ink-200 rounded-lg p-8 text-center">
          <p className="text-ink-500">Nenhum post ainda.</p>
          <Link
            href="/admin/posts/novo"
            className="mt-3 inline-block text-accent hover:underline"
          >
            Criar primeiro post
          </Link>
        </div>
      ) : (
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
              {posts.map((p) => (
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
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/posts/${p.id}`}
                      className="text-accent hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
