import prisma from "@/utils/prisma";
import { type NextAuthOptions } from "next-auth";
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

        const userRole = await prisma.md_user_role.findFirst({
          where: {
            user_id: user.user_id,
          },
          select: {
            user_type_id: true,
          },
        });

        // Corrected: Await bcrypt.compare
        const match = await bcrypt.compare(credentials.password, user.password);

        if (!match) {
          return null;
        }
        console.log(userRole.user_type_id);
        return {
          id: String(user.user_id), // Ensure `id` is a string
          email: user.email,
          userTypeId: userRole?.user_type_id || null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Store user id in the JWT token
        token.userTypeId = (user as any).userTypeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string; // Attach user id to session
        (session.user as any).userTypeId = (token as any).userTypeId;
      }
      return session;
    },
  },
};
