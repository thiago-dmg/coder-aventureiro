/**
 * POST /api/posts/[slug]/like
 *   Cria um like se ainda não existir; retorna o total atualizado e
 *   `liked: true`. Se já curtiu, retorna `liked: true` mas não incrementa.
 *
 * GET /api/posts/[slug]/like
 *   Retorna { count, liked } pra inicializar o botão na página.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFingerprint } from '@/lib/fingerprint';

type Params = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    select: { id: true, published: true },
  });
}

export async function GET(_: Request, { params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) {
    return NextResponse.json({ error: 'post não encontrado' }, { status: 404 });
  }

  const fingerprint = await getFingerprint();

  const [count, mine] = await Promise.all([
    prisma.like.count({ where: { postId: post.id } }),
    prisma.like.findUnique({
      where: { postId_fingerprint: { postId: post.id, fingerprint } },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({ count, liked: !!mine });
}

export async function POST(_: Request, { params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) {
    return NextResponse.json({ error: 'post não encontrado' }, { status: 404 });
  }

  const fingerprint = await getFingerprint();

  // upsert + count em uma transação evita race condition (2 cliques rápidos)
  const [, count] = await prisma.$transaction([
    prisma.like.upsert({
      where: { postId_fingerprint: { postId: post.id, fingerprint } },
      create: { postId: post.id, fingerprint },
      update: {}, // se já existe, não faz nada
    }),
    prisma.like.count({ where: { postId: post.id } }),
  ]);

  return NextResponse.json({ count, liked: true });
}
