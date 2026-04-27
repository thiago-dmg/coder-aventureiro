/**
 * POST /api/admin/posts — cria um post.
 * Protegido pelo middleware (já valida o JWT).
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug, tagsToString, parseTags } from '@/lib/slug';

type Body = {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  tags?: string;
  published?: boolean;
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body.title || !body.summary || !body.content) {
    return NextResponse.json(
      { error: 'title, summary e content são obrigatórios.' },
      { status: 400 },
    );
  }

  const slug = (body.slug?.trim() || generateSlug(body.title)).toLowerCase();

  // Garante slug único
  const exists = await prisma.post.findUnique({ where: { slug } });
  if (exists) {
    return NextResponse.json(
      { error: 'Já existe um post com esse slug.' },
      { status: 409 },
    );
  }

  const willPublish = !!body.published;

  const post = await prisma.post.create({
    data: {
      title: body.title.trim(),
      slug,
      summary: body.summary.trim(),
      content: body.content,
      coverImage: body.coverImage?.trim() || null,
      tags: tagsToString(parseTags(body.tags ?? '')),
      published: willPublish,
      publishedAt: willPublish ? new Date() : null,
    },
  });

  return NextResponse.json({ id: post.id, slug: post.slug }, { status: 201 });
}
