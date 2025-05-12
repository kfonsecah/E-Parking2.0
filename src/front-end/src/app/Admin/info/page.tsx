'use client'

export const dynamic = 'force-dynamic'

import { ChangeEvent } from 'react'
import Modal from '@/components/ui/Modal'
import { useInformationForm } from '@/app/hooks/useInformationForm'
import Image from "next/image";

const CreateInformation = () => {
    const {
        form,
        imageBase64,
        isModalOpen,
        modalMessage,
        handleChange,
        handleScheduleChange,
        handleImageChange,
        handleSubmit,
        closeModal,
    } = useInformationForm()

    return (
        <div className="min-h-screen bg-transparent pt-24 px-4 flex justify-center">
            <div className="w-full max-w-xl bg-white p-6 md:p-8 rounded-xl shadow-md">

                <h1 className="text-2xl md:text-3xl font-bold mb-10 text-center text-gray-800">
                    Información del Parqueo
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-lg">
                    <Input label="Nombre del parqueo" name="info_name" value={form.info_name} onChange={handleChange} />
                    <Input label="Ubicación" name="info_location" value={form.info_location} onChange={handleChange} />
                    <Input label="Cantidad de espacios" name="info_spaces" value={form.info_spaces} onChange={handleChange} />
                    <Input label="Nombre del dueño" name="info_owner" value={form.info_owner} onChange={handleChange} />
                    <Input label="Cédula del dueño" name="info_owner_id_card" value={form.info_owner_id_card} onChange={handleChange} />
                    <Input label="Teléfono del dueño" name="info_owner_phone" value={form.info_owner_phone} onChange={handleChange} />

                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block font-semibold mb-2 text-gray-700">Horario de atención</label>
                        <textarea
                            name="info_schedule"
                            value={form.info_schedule}
                            onChange={(e) => handleScheduleChange(e.target.value)}
                            rows={3}
                            className="border border-gray-300 rounded-md p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                            placeholder="Ej: Lunes a viernes de 8:00 a.m. a 5:00 p.m."
                            required
                        ></textarea>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block font-semibold mb-2 text-gray-700">Seleccionar imagen</label>
                        <div className="flex items-center gap-4 mb-2">
                            <label
                                htmlFor="imageInput"
                                className="cursor-pointer bg-gradient-to-r from-emerald-700 to-cyan-800 text-white font-semibold px-5 py-3 rounded-lg shadow transition-all duration-300 ease-in-out text-sm"
                            >
                                Buscar imagen
                            </label>
                            <span className="text-base text-gray-600">
                                {imageBase64 ? 'Imagen cargada' : 'Ninguna imagen seleccionada'}
                            </span>
                        </div>
                        <input
                            id="imageInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                    {imageBase64 && (
                        <div className="md:col-span-2 lg:col-span-3 mt-2">
                            <p className="font-semibold mb-2 text-gray-700 text-lg">Vista previa:</p>
                            <Image
                                src={`data:image/*;base64,${imageBase64}`}
                                alt="Vista previa"
                                width={500}
                                height={256}
                                className="max-w-full max-h-64 rounded border"
                            />
                        </div>
                    )}


                    <div className="md:col-span-2 lg:col-span-3 mt-4">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-700 to-cyan-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 ease-in-out w-full text-sm"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                <Modal isOpen={isModalOpen} message={modalMessage} onClose={closeModal} />
            </div>
        </div>
    )
}

// Componente de input reutilizable
const Input = ({
    label,
    name,
    value,
    onChange,
}: {
    label: string
    name: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) => (
    <div>
        <label className="block font-semibold mb-2 text-gray-700">{label}</label>
        <input
            name={name}
            value={value}
            onChange={onChange}
            className="border border-gray-300 rounded-md p-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
        />
    </div>
)

export default CreateInformation
