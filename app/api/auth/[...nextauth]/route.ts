import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { randomUUID } from "crypto";
import { API_BASE_URL } from "@/lib/config";

// Prefix of the error thrown when the account has two-factor enabled.
// The login form reads the challenge token after it and asks for a code.
const TWO_FACTOR_PREFIX = "TwoFactorRequired:";

interface BackendSession {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    profile?: { avatarUrl?: string | null } | null;
  };
  nextAuthSecret: string;
  expiresAt: string;
}

type BackendResult =
  | { ok: true; session: BackendSession }
  | { ok: true; challengeToken: string }
  | { ok: false; message: string; unavailable: boolean };

async function callBackend(path: string, body: Record<string, unknown>): Promise<BackendResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, clientToken: randomUUID() }),
    });
  } catch {
    return { ok: false, message: "AuthServiceUnavailable", unavailable: true };
  }
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    const unavailable = response.status >= 500 || response.status === 0;
    return { ok: false, message: json?.message || "CredentialsSignin", unavailable };
  }
  if (json.data?.twoFactorRequired) return { ok: true, challengeToken: json.data.challengeToken };
  return { ok: true, session: json.data };
}

function toNextAuthUser({ user, nextAuthSecret, expiresAt }: BackendSession): User {
  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    fullName: user.fullName,
    image: user.profile?.avatarUrl ?? undefined,
    role: user.role,
    profile: user.profile,
    nextAuthSecret,
    expiresAt,
  };
}

// Turns a backend result into what `authorize` must return or throw
function authorizeResult(result: BackendResult): User {
  if (!result.ok) throw new Error(result.unavailable ? "AuthServiceUnavailable" : result.message);
  if ("challengeToken" in result) throw new Error(`${TWO_FACTOR_PREFIX}${result.challengeToken}`);
  return toNextAuthUser(result.session);
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      return authorizeResult(
        await callBackend("/auth/login", { email: credentials.email, password: credentials.password })
      );
    },
  }),
  // Second sign-in step for accounts with two-factor authentication
  CredentialsProvider({
    id: "two-factor",
    name: "two-factor",
    credentials: {
      challengeToken: { label: "Challenge", type: "text" },
      code: { label: "Code", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.challengeToken || !credentials?.code) return null;
      return authorizeResult(
        await callBackend("/auth/2fa/verify", { challengeToken: credentials.challengeToken, code: credentials.code })
      );
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  // A fixed secret is only acceptable on a developer machine
  (process.env.NODE_ENV === "development" ? "themora-local-development-secret" : undefined);

const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      // The backend verifies Google's signed ID token; it never trusts the email alone
      if (!account.id_token) return false;
      const result = await callBackend("/auth/google", { idToken: account.id_token });
      if (!result.ok) return false;
      if ("challengeToken" in result) {
        return `/login?twoFactor=${encodeURIComponent(result.challengeToken)}`;
      }
      Object.assign(user, toNextAuthUser(result.session));
      return true;
    },
    async jwt({ token, user }) {
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
        session.user.profile = token.profile;
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
  secret,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
