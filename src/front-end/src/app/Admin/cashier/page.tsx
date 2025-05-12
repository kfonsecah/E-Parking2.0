'use client'
export const dynamic = 'force-dynamic'

import Modal from '@/components/ui/Modal'
import { useCashierForm } from '@/app/hooks/useCashierForm'

const CreateCashier = () => {
    const {
        form,
        isModalOpen,
        modalMessage,
        handleChange,
        handleSubmit,
        closeModal,
    } = useCashierForm()

    return (
        <div className="bg-transparent py-16 px-4 min-h-screen">
            <div className="w-full max-w-md mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md">

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registrar Caja</h2>

                <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Tipo de caja</label>
                        <input
                            name="cashType" // 👈 CAMBIO AQUÍ
                            value={form.cashType}
                            onChange={handleChange}
                            placeholder="Ej: Comun, Evento, etc."
                            className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-gray-700">Monto de apertura</label>
                        <input
                            name="openAmount" // 👈 CAMBIO AQUÍ
                            value={form.openAmount}
                            onChange={handleChange}
                            placeholder="Ej: 2500.00"
                            type="text"
                            className="border border-gray-300 rounded px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-emerald-700 to-cyan-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out w-full"
                    >
                        Abrir Caja
                    </button>
                </form>
                <Modal
                    isOpen={isModalOpen}
                    message={modalMessage}
                    onClose={closeModal}
                />
            </div>
        </div>
    )
}

export default CreateCashier
