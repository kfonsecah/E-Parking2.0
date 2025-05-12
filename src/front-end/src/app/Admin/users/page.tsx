'use client'
export const dynamic = 'force-dynamic'

import { Eye, EyeOff } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useUserRegistration } from '@/app/hooks/useUserRegistration'

const RegisterWithTable = () => {
    const {
        form,
        users,
        roles,
        showPassword,
        setShowPassword,
        isModalOpen,
        modalMessage,
        isConfirmOpen,
        handleChange,
        handleRegister,
        handleUpdate,
        confirmDelete,
        handleConfirmDelete,
        handleRowClick,
        closeModal,
        setIsConfirmOpen,
        setConfirmId,
    } = useUserRegistration()

    return (
        <div className="mt-8 p-6 md:p-10 max-w-5xl mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">Registrar Usuario</h1>
            <form className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <input name="users_name" placeholder="Nombre" value={form.users_name} onChange={handleChange} className="border border-gray-300 rounded-md p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required />
                    <input name="users_lastname" placeholder="Apellido" value={form.users_lastname} onChange={handleChange} className="border p-2" required />
                    <input name="users_id_card" placeholder="Cédula" value={form.users_id_card} onChange={handleChange} className="border p-2" required />
                    <input name="users_email" type="email" placeholder="Correo" value={form.users_email} onChange={handleChange} className="border p-2" required />
                    <input name="users_username" placeholder="Usuario" value={form.users_username} onChange={handleChange} className="border p-2" required />
                    <div className="relative">
                        <input
                            name="users_password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={form.users_password}
                            onChange={handleChange}
                            className="border p-2 w-full pr-10 rounded"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2 text-gray-400 hover:text-gray-700 transition-colors"
                            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <select name="rol_id" value={form.rol_id} onChange={handleChange} className="border border-gray-300 rounded-md p-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                        <option key={rol.rol_id} value={rol.rol_id}>
                            {rol.rol_name}
                        </option>
                    ))}
                </select>

                {form.users_id ? (
                    <>
                        <button type="button" onClick={handleUpdate} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full">Actualizar Usuario</button>
                        <button type="button" onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full">Eliminar Usuario</button>
                    </>
                ) : (
                    <button type="button" onClick={handleRegister} className="bg-gradient-to-r from-emerald-700 to-cyan-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out w-full">Registrar Usuario</button>
                )}
            </form>

            <h2 className="text-lg font-semibold mb-2">Usuarios Registrados</h2>
            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full text-sm text-left border">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 border">Nombre</th>
                            <th className="px-4 py-2 border">Apellido</th>
                            <th className="px-4 py-2 border">Usuario</th>
                            <th className="px-4 py-2 border">Correo</th>
                            <th className="px-4 py-2 border">Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.users_id} onClick={() => handleRowClick(user)} className="hover:bg-teal-50 cursor-pointer transition-all">
                                <td className="px-4 py-2 border">{user.users_name}</td>
                                <td className="px-4 py-2 border">{user.users_lastname}</td>
                                <td className="px-4 py-2 border">{user.users_username}</td>
                                <td className="px-4 py-2 border">{user.users_email}</td>
                                <td className="px-4 py-2 border">{user.roles?.[0]?.role?.rol_name ?? "Sin rol"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} message={modalMessage} onClose={closeModal} />

            <ConfirmModal
                isOpen={isConfirmOpen}
                message="¿Está seguro de eliminar este usuario y su rol?"
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsConfirmOpen(false)
                    setConfirmId(null)
                }}
            />
        </div>
    )
}

export default RegisterWithTable
