import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) return null;
        if (user.isBanned) throw new Error("Account is banned");

        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordsMatch) return null;

        const ipAddress = (req as any).headers?.['x-forwarded-for'] || 'Unknown IP';
        
        await prisma.$transaction([
          prisma.user.update({ where: { id: user.id }, data: { ipAddress } }),
          prisma.userLog.create({ data: { userId: user.id, action: 'LOGIN', ipAddress } })
        ]);

        return { id: user.id, email: user.email, name: user.username, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_dev_mode_only",
};
