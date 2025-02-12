import prisma from "@/utils/prisma";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.md_user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            user_id: true,
            email: true,
            password: true,
          },
        });

        if (!user) {
          return null;
        }

        // Corrected: Await bcrypt.compare
        const match = await bcrypt.compare(credentials.password, user.password);

        if (!match) {
          return null;
        }

        return {
          id: String(user.user_id), // Ensure `id` is a string
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
