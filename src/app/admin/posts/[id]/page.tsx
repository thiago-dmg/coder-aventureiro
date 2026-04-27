import { notFound } from 'next/navigation';
import PostForm from '@/components/PostForm';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Editar post' };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const post = await prisma.post.findUnique({ where: { id: numId } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar post</h1>
      <PostForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content,
          coverImage: post.coverImage ?? '',
          tags: post.tags,
          published: post.published,
        }}
      />
    </div>
  );
}
