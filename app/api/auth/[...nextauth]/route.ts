import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { randomUUID } from "crypto";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const clientToken = randomUUID();
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
          
          
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              clientToken: clientToken,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            if (response.status >= 500 || errorData?.message === "Failed to login" || errorData?.message === "Internal server error") {
              throw new Error("AuthServiceUnavailable");
            }
            return null;
          }

          const data = await response.json();

          if (data.success && data.data?.user) {
            const userData = {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.fullName,
              fullName: data.data.user.fullName,
              image: data.data.user.profile?.avatarUrl,
              nextAuthSecret: data.data.nextAuthSecret,
              expiresAt: data.data.expiresAt,
              role: data.data.user.role,
              profile: data.data.user.profile,
            };
            return userData;
          }

          return null;
        } catch (error) {
          if (error instanceof Error && error.message === "AuthServiceUnavailable") throw error;
          throw new Error("AuthServiceUnavailable");
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
          
          const response = await fetch(`${apiUrl}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              fullName: user.name,
              googleId: account.providerAccountId,
              avatarUrl: user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.user) {
              user.id = data.data.user.id;
              user.role = data.data.user.role;
              user.nextAuthSecret = data.data.nextAuthSecret;
              user.expiresAt = data.data.expiresAt;
              user.profile = data.data.user.profile;
            }
          }
        } catch (error) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.fullName = user.fullName;
        token.email = user.email;
        token.image = user.image;
        token.profile = user.profile;
        token.role = user.role;
        token.nextAuthSecret = user.nextAuthSecret;
        token.expiresAt = user.expiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.fullName = token.fullName as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.profile = token.profile as any;
        session.user.role = token.role as string;
        session.user.nextAuthSecret = token.nextAuthSecret as string;
        session.user.expiresAt = token.expiresAt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };