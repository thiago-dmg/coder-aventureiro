/**
 * Cliente Prisma singleton.
 *
 * Em dev, o Next faz hot-reload e recria módulos toda hora.
 * Sem esse padrão, a gente acabaria com várias instâncias do Prisma
 * abertas (e várias conexões com o banco). O `globalThis` resolve.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
