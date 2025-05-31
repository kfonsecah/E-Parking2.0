// src/app/hooks/useVehiclePackages.ts
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoader } from "@/context/LoaderContext";

interface VehiclePackageResponse {
  client_id: number;
  client_name: string;
  client_plate: string;
  package_active: boolean;
  message: string;
}

export function useVehiclePackages() {
  const { setIsLoading } = useLoader();
  const queryClient = useQueryClient();
  const [clientInfo, setClientInfo] = useState<VehiclePackageResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const verifyPackage = async (plate: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/vehicles/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veh_plate: plate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error verificando paquete");
        return false;
      }

      if (data.package_active) {
        setClientInfo(data);
        return true;
      }

      return false;
    } catch (err) {
      console.error("❌ Error verificando paquete:", err);
      setError("Error verificando paquete");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const exitVehicle = async (plate: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/vehicles/packages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veh_plate: plate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error actualizando estado del vehículo");
        return false;
      }

      // ✅ Corrección aquí
      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });

      return true;
    } catch (err) {
      console.error("❌ Error actualizando estado del vehículo:", err);
      setError("Error actualizando estado del vehículo");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetClientInfo = () => {
    setClientInfo(null);
    setError(null);
  };

  return {
    clientInfo,
    error,
    verifyPackage,
    exitVehicle,
    resetClientInfo,
  };
}
