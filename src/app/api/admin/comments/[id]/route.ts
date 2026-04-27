/**
 * DELETE /api/admin/comments/[id] — exclui comentário (somente admin).
 *
 * O middleware bloqueia /api/admin/* sem JWT válido, então aqui dentro
 * a gente já pode confiar.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isFinite(num)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  await prisma.comment.delete({ where: { id: num } }).catch(() => {
    // Se já não existe, ignora (DELETE é idempotente).
  });

  return NextResponse.json({ ok: true });
}
