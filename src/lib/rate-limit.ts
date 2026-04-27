/**
 * Rate limit baseado em queries no banco.
 *
 * Por que no banco e não em memória:
 *  - Sobrevive a restart do servidor.
 *  - Funciona com múltiplas instâncias (futuro deploy).
 *
 * Estratégia simples: conta quantas linhas existem na tabela X
 * com `ipHash` igual e `createdAt` recente.
 */
import { prisma } from './prisma';

type LimitConfig = {
  /** Janela de tempo em segundos. */
  windowSec: number;
  /** Máximo de eventos permitidos na janela. */
  max: number;
};

/**
 * Verifica rate limit pra criação de comentários.
 * Joga erro se o usuário ultrapassou o limite.
 */
export async function checkCommentRateLimit(
  ipHash: string,
  config: LimitConfig = { windowSec: 60 * 60, max: 5 }, // 5/hora por IP
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const since = new Date(Date.now() - config.windowSec * 1000);

  const count = await prisma.comment.count({
    where: {
      ipHash,
      createdAt: { gte: since },
    },
  });

  if (count >= config.max) {
    return { ok: false, retryAfterSec: config.windowSec };
  }
  return { ok: true };
}
