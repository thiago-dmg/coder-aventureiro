/**
 * GET  /api/posts/[slug]/comments — lista comentários (público, max 100)
 * POST /api/posts/[slug]/comments — cria comentário (público, com proteções)
 *
 * Proteções aplicadas no POST:
 *  - Honeypot: campo `website` deve vir vazio. Bots preenchem; humanos não veem.
 *  - Rate limit: 5 comentários por hora por IP.
 *  - Tamanho: nome até 50 chars, conteúdo até 2000.
 *  - Validação: conteúdo vazio é rejeitado.
 *  - XSS: nada de HTML — guardamos texto puro e o React escapa na renderização.
 *  - SQL injection: Prisma já usa queries parametrizadas.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIpHash } from '@/lib/fingerprint';
import { checkCommentRateLimit } from '@/lib/rate-limit';

type Params = { params: Promise<{ slug: string }> };

const AUTHOR_MAX = 50;
const CONTENT_MAX = 2000;
const CONTENT_MIN = 2;

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

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    // ⚠️ Não devolvemos ipHash pra ninguém.
    select: {
      id: true,
      author: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) {
    return NextResponse.json({ error: 'post não encontrado' }, { status: 404 });
  }

  let body: {
    author?: unknown;
    content?: unknown;
    website?: unknown; // honeypot
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // Honeypot — se vier preenchido, é bot. Respondemos 200 mas não criamos nada.
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const author = (typeof body.author === 'string' ? body.author : '').trim();
  const content = (typeof body.content === 'string' ? body.content : '').trim();

  if (content.length < CONTENT_MIN) {
    return NextResponse.json(
      { error: 'Comentário muito curto.' },
      { status: 400 },
    );
  }
  if (content.length > CONTENT_MAX) {
    return NextResponse.json(
      { error: `Comentário muito longo (máx ${CONTENT_MAX} chars).` },
      { status: 400 },
    );
  }
  if (author.length > AUTHOR_MAX) {
    return NextResponse.json(
      { error: `Nome muito longo (máx ${AUTHOR_MAX} chars).` },
      { status: 400 },
    );
  }

  const ipHash = await getIpHash();

  // Rate limit: 5 comentários/hora por IP
  const check = await checkCommentRateLimit(ipHash);
  if (!check.ok) {
    return NextResponse.json(
      { error: 'Calma aí — muitos comentários em pouco tempo. Tenta de novo daqui a pouco.' },
      { status: 429 },
    );
  }

  const created = await prisma.comment.create({
    data: {
      postId: post.id,
      author: author || 'Anônimo',
      content, // texto puro — React escapa na renderização
      ipHash,
    },
    select: { id: true, author: true, content: true, createdAt: true },
  });

  return NextResponse.json({ comment: created }, { status: 201 });
}
