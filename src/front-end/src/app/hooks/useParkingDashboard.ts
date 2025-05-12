"use client";

import { useMemo, useEffect, startTransition } from "react";
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { colorMap } from "@/lib/colors";
import { useLoader } from "@/context/LoaderContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface VehicleRaw {
  veh_id: number;
  veh_plate: string;
  veh_reference: string;
  veh_owner: string;
  veh_color: string;
  veh_ingress_date: string;
}

interface VehicleFormatted {
  date: string;
  id: string;
  plate: string;
  reference: string;
  owner: string;
  color: string;
  time: string;
  status: "IN";
}

interface DashboardResponse {
  totalIngresos: number;
  availableSpaces: number;
  totalSpaces: {
    info_spaces: number;
  };
  onExitCars: number;
  parkedCars: number;
}

interface ParkingInfoResponse {
  info_name: string;
  info_location: string;
  imageBase64: string | null;
}

export function useParkingDashboard() {
  const router = useRouter();
  const { setIsLoading } = useLoader();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: session } = useSession();

  const name = user?.name || session?.user?.name || "Invitado";

  const dashboardQuery = useQuery<DashboardResponse>({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Error al cargar el dashboard");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true, // Habilita la actualización al volver a la página
  });

  const vehiclesQuery = useQuery<VehicleRaw[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Error al cargar los vehículos");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true, // Habilita la actualización al volver a la página
  });

  const infoQuery = useQuery<ParkingInfoResponse>({
    queryKey: ["parkingInfo"],
    queryFn: async () => {
      const res = await fetch("/api/information");
      if (!res.ok) throw new Error("Error al cargar la información");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true, // Habilita la actualización al volver a la página
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al eliminar el vehículo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
    },
  });

  const isLoadingQueries =
    dashboardQuery.isFetching ||
    vehiclesQuery.isFetching ||
    infoQuery.isFetching;

  useEffect(() => {
    startTransition(() => {
      setIsLoading(isLoadingQueries);
    });
  }, [isLoadingQueries, setIsLoading]);

  const entries: VehicleFormatted[] = useMemo(() => {
    return (vehiclesQuery.data ?? []).map((veh) => {
      const utcDate = new Date(veh.veh_ingress_date);
      const crTime = new Date(utcDate.getTime() - 6 * 60 * 60 * 1000);
      const formattedTime = crTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return {
        id: veh.veh_id.toString(),
        plate: veh.veh_plate,
        reference: veh.veh_reference,
        owner: veh.veh_owner,
        color: colorMap[veh.veh_color?.toLowerCase()] || "gray",
        time: formattedTime,
        date: utcDate.toISOString().split("T")[0],
        status: "IN",
      };
    });
  }, [vehiclesQuery.data]);

  const stats = useMemo(() => {
    const d = dashboardQuery.data;
    if (!d) {
      return {
        ingress: "0.00",
        available: 0,
        vehiclesIngressed: 0,
        onExit: 0,
      };
    }

    return {
      ingress: d.totalIngresos.toFixed(2),
      available: d.availableSpaces,
      vehiclesIngressed: d.parkedCars || 0, // 🔥 <-- AQUÍ CAMBIAS
      onExit: d.onExitCars,
    };
  }, [dashboardQuery.data]);

  const info = useMemo(() => {
    const i = infoQuery.data;
    return {
      info_name: i?.info_name || "",
      info_location: i?.info_location || "",
      info_image: i?.imageBase64 || null,
    };
  }, [infoQuery.data]);

  const handleDelete = (id: string) => deleteMutation.mutate(id);

  return {
    entries,
    stats,
    info,
    name,
    router,
    handleDelete,
    isSubmitting: deleteMutation.isPending,
  };
}
