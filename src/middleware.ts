/**
 * Middleware do Next — roda em toda request que casar com o matcher.
 * Protege rotas administrativas validando o JWT.
 *
 * Importante: middleware roda em Edge runtime, então não dá pra usar
 * o Prisma aqui. Por isso só validamos o JWT.
 *
 * Mapa de proteção:
 *   /admin/*                       → admin (exceto /admin/login)
 *   /api/admin/*                   → admin (CRUD posts, moderação comments)
 *   /api/posts/:slug/like          → PÚBLICO
 *   /api/posts/:slug/comments      → PÚBLICO
 */
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'auth_token';

async function isValidToken(token: string | undefined) {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // login é público
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin/');

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const ok = await isValidToken(token);

    if (!ok) {
      if (isAdminPage) {
        const url = req.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
      }
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Só /admin/* e /api/admin/* — as rotas /api/posts/[slug]/* são públicas
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
