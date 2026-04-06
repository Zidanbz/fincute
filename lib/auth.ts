import { compare, hash } from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./prisma";
import { Adapter } from "next-auth/adapters";

const adapter = PrismaAdapter(prisma) as Adapter;

const providers = [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  ...(process.env.EMAIL_SERVER && process.env.EMAIL_FROM
    ? [
        EmailProvider({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM,
        }),
      ]
    : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) {
          console.warn("Credentials auth: user not found or no passwordHash", credentials.email);
          return null;
        }
        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          console.warn("Credentials auth: invalid password for", credentials.email);
          return null;
        }
        return { id: user.id, email: user.email, name: user.name ?? user.email };
      },
    }),
  ];

export const authConfig: NextAuthConfig = {
  adapter,
  providers,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export async function hashPassword(password: string) {
  return hash(password, 10);
}
