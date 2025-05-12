// hooks/useTaxForm.ts
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TaxResponse {
  tax_price: number;
}

export const useTaxForm = () => {
  const queryClient = useQueryClient();

  const [taxPrice, setTaxPrice] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const { data } = useQuery<TaxResponse>({
    queryKey: ["tax"],
    queryFn: async () => {
      const res = await fetch("/api/tax");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se pudo obtener el precio actual");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setTaxPrice(data.tax_price.toString());
    }
  }, [data]);

  const updateTaxMutation = useMutation({
    mutationFn: async (newTaxPrice: number) => {
      const res = await fetch("/api/tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tax_price: newTaxPrice }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el impuesto");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tax"] }); 
      showModal("✅ Precio actualizado");
      setTaxPrice(data.tax_price.toString());
    },
    onError: () => {
      showModal("❌ Error de conexión con la API");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(taxPrice);

    if (isNaN(numericPrice) || numericPrice < 0) {
      showModal("❌ El precio debe ser un número positivo");
      return;
    }

    updateTaxMutation.mutate(numericPrice);
  };

  return {
    taxPrice,
    setTaxPrice,
    isModalOpen,
    modalMessage,
    handleSubmit,
    closeModal,
    isSubmitting: updateTaxMutation.isPending,
  };
};
