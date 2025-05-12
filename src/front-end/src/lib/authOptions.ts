import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";
import { v4 as uuidv4 } from "uuid";

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string;
    sessionId?: string;
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
    async signIn({ profile, user }) {
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

      // ❌ Bloquear si ya hay sesión activa
      if (userInDb.session_id) {
        throw new Error(
          "SessionAlreadyActive|Ya hay una sesión activa con esta cuenta."
        );
      }

      // ✅ Crear session_id y registrar última actividad
      const sessionId = uuidv4();
      const now = new Date();

      await prisma.ep_users.update({
        where: { users_id: userInDb.users_id },
        data: {
          session_id: sessionId,
          session_last_activity: now,
        },
      });

      const adapterUser = user as AdapterUser;
      adapterUser.name = `${userInDb.users_name} ${userInDb.users_lastname}`;
      adapterUser.email = userInDb.users_email;
      adapterUser.role = userInDb.roles?.[0]?.role?.rol_name || "Usuario";
      adapterUser.id = userInDb.users_id.toString();
      adapterUser.sessionId = sessionId;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        (token as any).role = (user as any).role;
        (token as any).id = (user as any).id;
        (token as any).sessionId = (user as any).sessionId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        (session.user as any).role = (token as any).role;
        (session.user as any).id = (token as any).id;
        (session.user as any).sessionId = (token as any).sessionId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
    error: "/auth", // redirige errores personalizados
  },

  secret: process.env.NEXTAUTH_SECRET,
};
