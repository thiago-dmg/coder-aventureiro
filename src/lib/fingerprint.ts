/**
 * Gera um identificador "razoável" do visitante a partir do IP + User-Agent.
 *
 * Limitações conhecidas:
 *  - Mesmo Wi-Fi + mesmo browser = mesmo fingerprint (poucas colisões na prática).
 *  - VPN/proxy mudando IP = fingerprint diferente (pode burlar o "1 like").
 *
 * Pra um blog pessoal, é suficiente. Se um dia precisar de algo mais robusto,
 * adiciona um cookie UUID e combina com isso.
 */
import { headers } from 'next/headers';
import crypto from 'crypto';

function hashSha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

async function getRequestInfo() {
  const h = await headers();
  // x-forwarded-for vem da Vercel, Cloudflare, Nginx etc.
  // Em local, ele costuma vir vazio — caímos no fallback.
  const forwarded = h.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'localhost';
  const ua = h.get('user-agent') || '';
  return { ip, ua };
}

/** Hash de IP + UA — usado para identificar o visitante de forma estável. */
export async function getFingerprint(): Promise<string> {
  const { ip, ua } = await getRequestInfo();
  return hashSha256(`${ip}::${ua}`);
}

/** Apenas o IP hasheado — usado pra rate limit (não depende do browser). */
export async function getIpHash(): Promise<string> {
  const { ip } = await getRequestInfo();
  return hashSha256(ip);
}
