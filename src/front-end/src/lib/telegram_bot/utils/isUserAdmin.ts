// lib/telegram_bot/utils/isUserAdmin.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function isUserAdmin(userId: number): Promise<boolean> {
  const user = await prisma.ep_users.findUnique({
    where: { users_id: userId },
    include: { roles: { include: { role: true } } },
  });

  return (
    user?.roles.some((r) =>
      ["admin", "administrador", "desarrollador", "dev"].includes(
        r.role.rol_name.toLowerCase()
      )
    ) || false
  );
}
