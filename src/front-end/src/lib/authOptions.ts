import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      sessionId: string;
    };
  }
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ profile, user, account }) {
      if (!profile?.email) return false;

      const userInDb = await prisma.ep_users.findFirst({
        where: { users_email: profile.email },
        include: {
          roles: { include: { role: true } },
        },
      });

      if (!userInDb) {
        throw new Error(
          "401|Usuario no registrado. Comuníquese con el administrador."
        );
      }

      // Crear nuevo `sessionId` para NextAuth
      const sessionId = uuidv4();
      const now = new Date();

      await prisma.ep_users.update({
        where: { users_id: userInDb.users_id },
        data: {
          session_id: sessionId,
          session_last_activity: now,
        },
      });

      // Asignar datos adicionales al usuario
      user.id = userInDb.users_id.toString();
      user.name = `${userInDb.users_name} ${userInDb.users_lastname}`;
      user.email = userInDb.users_email;
      (user as any).role = userInDb.roles?.[0]?.role?.rol_name || "Usuario";
      (user as any).sessionId = sessionId;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        (token as any).role = (user as any).role;
        (token as any).sessionId = (user as any).sessionId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as any).role = (token as any).role;
        (session.user as any).sessionId = (token as any).sessionId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
    error: "/auth", // Redirige errores personalizados
  },

  secret: process.env.NEXTAUTH_SECRET,
};
