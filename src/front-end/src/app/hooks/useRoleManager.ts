import { useState, useEffect, FormEvent, useCallback } from "react";

export const useRoleManager = () => {
  const [form, setForm] = useState({
    rol_id: null,
    rol_name: "",
    rol_version: 1,
  });

  const [roles, setRoles] = useState<any[]>([]);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      setRoles(data);
    } catch {
      showModal("Error al cargar los roles.");
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const method = form.rol_id ? "PATCH" : "POST";
    const endpoint = form.rol_id ? `/api/roles/${form.rol_id}` : "/api/roles";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rol_name: form.rol_name,
          rol_version: form.rol_version,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showModal(data.error || "Error al procesar el rol");
      } else {
        showModal(form.rol_id ? "✅ Rol actualizado" : "✅ Rol creado");
        resetForm();
        fetchRoles();
      }
    } catch {
      showModal("Error de conexión al servidor.");
    }
  };

  const handleConfirmDelete = () => {
    if (confirmId !== null) {
      handleDelete(confirmId);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showModal(data.error || "Error al eliminar el rol");
      } else {
        showModal("✅ Rol eliminado correctamente");
        resetForm();
        fetchRoles();
      }
    } catch {
      showModal("Error al conectar con la API");
    } finally {
      setIsConfirmOpen(false);
      setConfirmId(null);
    }
  };

  const handleRowClick = async (rol: any) => {
    const res = await fetch(`/api/roles-assigned?id=${rol.rol_id}`);
    const data = await res.json();

    if (!res.ok) {
      showModal(data.error || "Error al verificar si el rol está asignado.");
      return;
    }

    if (data.assigned) {
      showModal(
        "❌ Este rol está asignado a usuarios. No puede ser editado ni eliminado."
      );
      return;
    }

    setForm({
      rol_id: rol.rol_id,
      rol_name: rol.rol_name,
      rol_version: rol.rol_version,
    });
  };

  const confirmDelete = () => {
    if (form.rol_id !== null) {
      setConfirmId(form.rol_id);
      setIsConfirmOpen(true);
    }
  };

  const resetForm = () => {
    setForm({ rol_id: null, rol_name: "", rol_version: 1 });
  };

  return {
    form,
    roles,
    isModalOpen,
    modalMessage,
    isConfirmOpen,
    confirmId,
    handleChange,
    handleSubmit,
    handleRowClick,
    confirmDelete,
    handleConfirmDelete,
    closeModal,
    setIsConfirmOpen,
    setConfirmId,
  };
};
