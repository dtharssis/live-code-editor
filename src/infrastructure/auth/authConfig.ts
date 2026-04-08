import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '../db/client';
import { authConfigEdge } from './authConfig.edge';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfigEdge,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfigEdge.callbacks,
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where:  { email: user.email! },
          select: { id: true, plan: true, aiRequestsUsed: true },
        });
        if (dbUser) {
          token.id             = dbUser.id;
          token.plan           = dbUser.plan;
          token.aiRequestsUsed = dbUser.aiRequestsUsed;
        }
      }
      return token;
    },
  },
});
