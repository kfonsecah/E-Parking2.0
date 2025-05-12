"use client";

import { useMutation } from "@tanstack/react-query";
import { generateEgressTicket } from "@/lib/egressTicket"; // asumimos que ahí está

interface VehicleData {
  owner: string;
  plate: string;
  reference: string;
  ingressDate: string;
  egressDate: string;
  fare: number;
}

export function useGenerateEgressTicket() {
  const mutation = useMutation({
    mutationFn: async (data: VehicleData) => {
      await generateEgressTicket({
        ...data,
        fare: data.fare.toFixed(2),
      });
    },
    onError: (error) => {
      console.error("Error generando tiquete de salida:", error);
      alert("No se pudo generar el tiquete de salida.");
    },
  });

  return {
    printEgressTicket: mutation.mutate,
    isSubmitting: mutation.isPending,
  };
}
