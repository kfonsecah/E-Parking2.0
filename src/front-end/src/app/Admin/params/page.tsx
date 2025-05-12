'use client'
export const dynamic = 'force-dynamic'

import Modal from '@/components/ui/Modal'
import { useTaxForm } from '@/app/hooks/useTaxForm'

export default function TaxForm() {
    const {
        taxPrice,
        setTaxPrice,
        isModalOpen,
        modalMessage,
        handleSubmit,
        closeModal
    } = useTaxForm()

    return (
        <div className="mt-16 max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Precio por hora</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="tax_price" className="block font-medium">Ingrese el precio</label>
                    <input
                        type="text"
                        id="tax_price"
                        name="tax_price"
                        value={taxPrice}
                        onChange={e => setTaxPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-700 to-cyan-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out w-full"
                >
                    Guardar
                </button>
            </form>

            <Modal
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={closeModal}
            />
        </div>
    )
}
