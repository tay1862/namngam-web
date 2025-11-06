import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { rateLimit, getClientIP, SECURITY_CONFIG } from './security';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any, req: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Rate limiting for login attempts
        try {
          const clientIP = getClientIP(req);
          const rateLimitResult = rateLimit(`login:${clientIP}`, SECURITY_CONFIG.LOGIN_RATE_LIMIT_MAX);
          
          if (!rateLimitResult.success) {
            throw new Error('Too many login attempts. Please try again later.');
          }
        } catch (error) {
          // Continue with authentication if rate limiting fails
        }

        // Sanitize input
        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.isActive) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SECURITY_CONFIG.SESSION_MAX_AGE,
    updateAge: SECURITY_CONFIG.SESSION_UPDATE_AGE,
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  // @ts-ignore
  secret: process.env.NEXTAUTH_SECRET,
};
