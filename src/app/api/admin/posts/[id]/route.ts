/**
 * PUT    /api/admin/posts/[id] — atualiza
 * DELETE /api/admin/posts/[id] — exclui
 * Protegido pelo middleware.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, tagsToString, parseTags } from '@/lib/slug';

type Params = { params: Promise<{ id: string }> };

async function getId(params: Params['params']) {
  const { id } = await params;
  const num = Number(id);
  return Number.isFinite(num) ? num : null;
}

export async function PUT(req: Request, { params }: Params) {
  const id = await getId(params);
  if (id === null) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

  const body = await req.json();

  if (!body.title || !body.summary || !body.content) {
    return NextResponse.json(
      { error: 'title, summary e content são obrigatórios.' },
      { status: 400 },
    );
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'não encontrado' }, { status: 404 });

  const newSlug = (body.slug?.trim() || generateSlug(body.title)).toLowerCase();

  // Se mudou o slug, garante que não colide com outro
  if (newSlug !== existing.slug) {
    const dup = await prisma.post.findUnique({ where: { slug: newSlug } });
    if (dup) {
      return NextResponse.json(
        { error: 'Já existe um post com esse slug.' },
        { status: 409 },
      );
    }
  }

  const willPublish = !!body.published;
  // Mantém publishedAt se já estava publicado; seta agora se está publicando pela 1ª vez
  const publishedAt = willPublish
    ? existing.publishedAt ?? new Date()
    : null;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: body.title.trim(),
      slug: newSlug,
      summary: body.summary.trim(),
      content: body.content,
      coverImage: body.coverImage?.trim() || null,
      tags: tagsToString(parseTags(body.tags ?? '')),
      published: willPublish,
      publishedAt,
    },
  });

  return NextResponse.json({ id: updated.id, slug: updated.slug });
}

export async function DELETE(_: Request, { params }: Params) {
  const id = await getId(params);
  if (id === null) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
