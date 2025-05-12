// hooks/useCashPerDayForm.ts
import { useSession } from "next-auth/react";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";

interface CashPerDayFormData {
  cpd_amount: string;
  cpd_date: string;
  user_id: string;
}

export const useCashPerDayForm = () => {
  const { data: session, status } = useSession();

  const [form, setForm] = useState<CashPerDayFormData>({
    cpd_amount: "",
    cpd_date: "",
    user_id: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        user_id: (session.user as any).id || "",
      }));
      setUserName(session.user.name || "");
    } else {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("ep_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setForm((prev) => ({
            ...prev,
            user_id: parsed.user_id?.toString() || "",
          }));
          setUserName(`${parsed.users_name} ${parsed.users_lastname}`);
        }
      }
    }

    const now = new Date();
    const costaRicaOffset = -6 * 60;
    const localDate = new Date(
      now.getTime() + (costaRicaOffset + now.getTimezoneOffset()) * 60000
    );
    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();
    const formatted = `${day}/${month}/${year}`; 
    setForm((prev) => ({ ...prev, cpd_date: formatted }));
  }, [session]);

  const mutation = useMutation({
    mutationFn: async (formData: CashPerDayFormData) => {
      const res = await fetch("/api/cash-per-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }
      return res.json();
    },
    onSuccess: () => {
      setModalMessage("✅ Registro guardado correctamente");
      setIsModalOpen(true);
      setForm((prev) => ({ ...prev, cpd_amount: "" }));
    },
    onError: (error: any) => {
      setModalMessage(error.message || "Error de conexión con la API");
      setIsModalOpen(true);
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
    userName,
    modalMessage,
    isModalOpen,
    status,
    handleChange,
    handleSubmit,
    closeModal: () => setIsModalOpen(false),
    isSubmitting: mutation.isPending,
  };
};
