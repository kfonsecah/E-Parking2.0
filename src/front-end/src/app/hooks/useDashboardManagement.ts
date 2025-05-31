"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface Nota {
  id: number;
  contenido: string;
  fecha: string;
  expiracion?: string;
  estado: string;
  color: string;
  usuario: string;
}

interface NotasResponse {
  ok: boolean;
  notas?: Nota[];
  error?: string;
}

export function useDashboardManagement() {
  const router = useRouter();
  const { user } = useUser();
  const { data: session } = useSession();

  const name = user?.name || session?.user?.name || "Invitado";
  const role = user?.role || (session?.user as any)?.role || "Sin rol";

  const { data, isPending, error } = useQuery<NotasResponse>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("/api/notes");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Error al obtener las notas");
      }
      return json;
    },
    refetchInterval: 10000,
  });

  return {
    router,
    name,
    role,
    notas: data?.notas ?? [],
    loadingNotas: isPending,
    errorNotas: error?.message || null,
  };
}
