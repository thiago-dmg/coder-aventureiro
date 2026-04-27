import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DeleteCommentButton from './DeleteCommentButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Comentários' };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      post: { select: { slug: true, title: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comentários</h1>

      {comments.length === 0 ? (
        <p className="text-ink-500">Nenhum comentário ainda.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="border border-ink-200 rounded-lg p-4 bg-white"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium">
                    {c.author}{' '}
                    <span className="text-ink-500 font-normal text-xs">
                      em{' '}
                      <Link
                        href={`/posts/${c.post.slug}`}
                        className="text-accent hover:underline"
                      >
                        {c.post.title}
                      </Link>
                    </span>
                  </p>
                </div>
                <span className="text-xs text-ink-500">{formatDate(c.createdAt)}</span>
              </div>

              <p className="text-ink-700 whitespace-pre-wrap break-words text-sm">
                {c.content}
              </p>

              <div className="mt-3 text-right">
                <DeleteCommentButton id={c.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
