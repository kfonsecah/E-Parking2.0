'use client'

export const dynamic = 'force-dynamic'

import { Pencil, Trash2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { usePackagesManager } from '@/app/hooks/usePackagesManager'

const PackagesManager = () => {
  const {
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
  } = usePackagesManager()

  return (
    <div className="mt-16 p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Gestión de Paquetes</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          name="pack_name"
          placeholder="Nombre del paquete"
          value={form.pack_name}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-md p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          name="pack_price"
          placeholder="Precio"
          type="number"
          value={form.pack_price}
          onChange={handleChange}
          required
          className="border rounded p-2"
        />
        <div className="md:col-span-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-700 to-cyan-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out w-full"
          >
            {selectedId ? 'Actualizar Paquete' : 'Crear Paquete'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg shadow-sm mt-6">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Precio</th>
              <th className="border p-2">Editar</th>
              <th className="border p-2">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.pack_id} className="text-center">
                <td className="border p-2">{p.pack_name}</td>
                <td className="border p-2">₡{p.pack_price}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded-md transition-all duration-200 flex items-center gap-1"
                    title="Editar"
                  >
                    Editar
                    <Pencil size={18} />
                  </button>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => confirmDelete(p.pack_id)}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-all duration-200 flex items-center gap-1"
                    title="Eliminar"
                  >
                    Eliminar
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} message={modalMessage} onClose={closeModal} />

      <ConfirmModal
        isOpen={isConfirmOpen}
        message="¿Estás seguro de que deseas eliminar este paquete?"
        onCancel={closeConfirm}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default PackagesManager
