"use client";

import { useMutation } from "@tanstack/react-query";
import { generateIngressTicket } from "@/lib/entryTicket";

interface TicketData {
  owner: string;
  plate: string;
  reference: string;
  ingressDate: string;
}

export const useTicketPrinter = () => {
  const printIngressTicketMutation = useMutation({
    mutationFn: async (data: TicketData) => {
      await generateIngressTicket(data);
    },
    onError: (error) => {
      console.error("Error al imprimir el tiquete:", error);
      alert("No se pudo generar el tiquete.");
    },
  });

  return {
    printIngressTicket: printIngressTicketMutation.mutate,
    isPrinting: printIngressTicketMutation.isPending,
  };
};
