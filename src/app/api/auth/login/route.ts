import { NextResponse } from 'next/server';
import {
  verifyCredentials,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const ok = await verifyCredentials(username, password);
    if (!ok) {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos.' },
        { status: 401 },
      );
    }

    const token = await createSessionToken(username);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('login error', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
