/**
 * Autenticação simples com JWT em cookie httpOnly.
 *
 * Não precisamos de NextAuth porque temos só UM admin.
 * O fluxo é:
 *  1. POST /api/auth/login com {username, password}
 *  2. Compara com ADMIN_USERNAME e bcrypt(ADMIN_PASSWORD_HASH)
 *  3. Se ok, gera JWT e seta como cookie "auth_token"
 *  4. Middleware valida o JWT em rotas /admin/*
 */
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'auth_token';
const TOKEN_TTL = '7d'; // 7 dias

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET não definido no .env');
  return new TextEncoder().encode(secret);
}

export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUser || !expectedHash) {
    throw new Error('ADMIN_USERNAME/ADMIN_PASSWORD_HASH não definidos');
  }
  if (username !== expectedUser) return false;
  return bcrypt.compare(password, expectedHash);
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/**
 * Lê o cookie e valida. Use em Server Components / Server Actions
 * que precisem garantir admin.
 */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
