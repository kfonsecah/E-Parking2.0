import { useState, ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";

interface CashierFormData {
  cashType: string;
  openAmount: string;
}

export const useCashierForm = () => {
  const [form, setForm] = useState<CashierFormData>({
    cashType: "",
    openAmount: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (msg: string) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const mutation = useMutation({
    mutationFn: async (formData: CashierFormData) => {
      const res = await fetch("/api/cashier/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashType: formData.cashType,
          openAmount: parseFloat(formData.openAmount),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al abrir caja");
      }
      return res.json();
    },
    onSuccess: () => {
      showModal("✅ Caja abierta correctamente");
      setForm({ cashType: "", openAmount: "" });
    },
    onError: (error: any) => {
      showModal(error.message || "Error de conexión con la API");
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return {
    form,
    isModalOpen,
    modalMessage,
    handleChange,
    handleSubmit,
    closeModal: () => setIsModalOpen(false),
    isSubmitting: mutation.isPending,
  };
};
