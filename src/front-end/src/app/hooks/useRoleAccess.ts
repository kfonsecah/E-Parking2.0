// src/app/hooks/useRoleAccess.ts
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";

export function useRoleAccess() {
  const { user } = useUser();
  const { data: session } = useSession();

  const rawRole = user?.role || (session?.user as any)?.role || "Sin rol";
  const normalizedRole = rawRole.toLowerCase();

  const isFullAccess = [
    "admin",
    "administrador",
    "desarrollador",
    "dev",
  ].includes(normalizedRole);
  const isCashierOnly = ["cajero/a", "cajero", "cajera"].includes(
    normalizedRole
  );
  const isAssistant = normalizedRole === "asistente";

  return {
    rawRole,
    normalizedRole,
    isFullAccess,
    isCashierOnly,
    isAssistant,
    canSeeAdminMenu: isFullAccess || isCashierOnly || isAssistant,
    canSeeCajaPerDay:
      isFullAccess ||
      isCashierOnly ||
      (isAssistant &&
        typeof window !== "undefined" &&
        window.innerWidth >= 768),
    canSeeEntryMobile:
      isAssistant && typeof window !== "undefined" && window.innerWidth < 768,
  };
}
