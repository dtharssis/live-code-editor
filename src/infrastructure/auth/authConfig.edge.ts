import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

/**
 * Edge-safe auth config — no Prisma, no Node.js-only modules.
 * Used by middleware only (runs on Edge Runtime).
 */
export const authConfigEdge = {
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' } as const,
  pages: { signIn: '/login' },
  callbacks: {
    session({ session, token }) {
      if (token && session.user) {
        session.user.id             = token.id as string;
        session.user.plan           = token.plan as string;
        session.user.aiRequestsUsed = token.aiRequestsUsed as number;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
