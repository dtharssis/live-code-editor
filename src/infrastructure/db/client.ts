import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

type GlobalWithPrisma = typeof globalThis & { _prisma?: PrismaClient };
const g = globalThis as GlobalWithPrisma;

export const prisma = g._prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') g._prisma = prisma;
