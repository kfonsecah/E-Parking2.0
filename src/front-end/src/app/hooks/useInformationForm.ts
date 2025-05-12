// hooks/useInformationForm.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";

interface InformationFormData {
  info_name: string;
  info_location: string;
  info_spaces: string;
  info_owner: string;
  info_owner_id_card: string;
  info_owner_phone: string;
  info_schedule: string;
  info_version?: number;
  imageBase64?: string | null;
}

export const useInformationForm = () => {
  const [form, setForm] = useState<InformationFormData>({
    info_name: "",
    info_location: "",
    info_spaces: "",
    info_owner: "",
    info_owner_id_card: "",
    info_owner_phone: "",
    info_schedule: "",
  });

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const { data, error } = useQuery({
    queryKey: ["information"],
    queryFn: async () => {
      const res = await fetch("/api/information");
      if (!res.ok) {
        throw new Error("Error al cargar la información");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        info_name: data.info_name || "",
        info_location: data.info_location || "",
        info_spaces: data.info_spaces?.toString() || "",
        info_owner: data.info_owner || "",
        info_owner_id_card: data.info_owner_id_card || "",
        info_owner_phone: data.info_owner_phone || "",
        info_schedule: data.info_schedule || "",
      });
      setImageBase64(data.imageBase64 || null);
    }
    if (error) {
      showModal("Error al cargar la información");
    }
  }, [data, error]);

  const mutation = useMutation({
    mutationFn: async (formData: InformationFormData) => {
      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar la información");
      }
      return res.json();
    },
    onSuccess: () => {
      showModal("✅ Información guardada exitosamente");
    },
    onError: (error: any) => {
      showModal(error.message || "Error de conexión con la API");
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (value: string) => {
    setForm((prev) => ({ ...prev, info_schedule: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!imageBase64) {
      showModal("Por favor seleccione una imagen.");
      return;
    }

    mutation.mutate({
      ...form,
      info_version: 1,
      imageBase64,
    });
  };

  return {
    form,
    imageBase64,
    isModalOpen,
    modalMessage,
    handleChange,
    handleScheduleChange,
    handleImageChange,
    handleSubmit,
    closeModal,
    isSubmitting: mutation.isPending,
  };
};
