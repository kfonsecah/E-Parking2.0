import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PackageFormData {
  pack_name: string;
  pack_price: string;
}

export const usePackagesManager = () => {
  const queryClient = useQueryClient();

  const [packages, setPackages] = useState<any[]>([]);
  const [form, setForm] = useState<PackageFormData>({ pack_name: "", pack_price: "" });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const showModal = (msg: string) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeConfirm = () => setIsConfirmOpen(false);

  const { data } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) {
        throw new Error("Error al cargar los paquetes");
      }
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setPackages(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (formData: PackageFormData) => {
      if (!formData.pack_name.trim() || !formData.pack_price.trim()) {
        throw new Error("El nombre y el precio del paquete son requeridos.");
      }

      if (selectedId && isNaN(selectedId)) {
        throw new Error("ID del paquete no válido.");
      }

      const res = await fetch(
        selectedId ? `/api/packages/${selectedId}` : "/api/packages",
        {
          method: selectedId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageName: formData.pack_name.trim(),
            packagePrice: parseFloat(formData.pack_price),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el paquete");
      }
      return data;
    },
    onSuccess: () => {
      showModal(selectedId ? "✅ Paquete actualizado" : "✅ Paquete creado");
      setForm({ pack_name: "", pack_price: "" });
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["packages"] }); // Corregido
    },
    onError: (error: any) => {
      showModal(error.message || "Error al guardar el paquete");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar el paquete");
      }
      return data;
    },
    onSuccess: () => {
      showModal("🗑️ Paquete eliminado");
      setConfirmId(null);
      setIsConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ["packages"] }); // Corregido
    },
    onError: (error: any) => {
      showModal(error.message || "Error al eliminar el paquete");
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleEdit = (p: any) => {
    setSelectedId(p.pack_id);
    setForm({ pack_name: p.pack_name, pack_price: p.pack_price.toString() });
  };

  const confirmDelete = (id: number) => {
    setConfirmId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = () => {
    if (confirmId) {
      deleteMutation.mutate(confirmId);
    }
  };

  return {
    packages,
    form,
    selectedId,
    isModalOpen,
    modalMessage,
    isConfirmOpen,
    handleChange,
    handleSubmit,
    handleEdit,
    confirmDelete,
    handleDelete,
    closeModal,
    closeConfirm,
    isSubmitting: mutation.isPending || deleteMutation.isPending,
  };
};
