'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';
import { useRegisterClientForm } from '@/app/hooks/useRegisterClientForm';
import Modal from '@/components/ui/Modal';

const RegisterClientPage = () => {
    const {
        form,
        packages,
        loadingPackages,
        handleChange,
        handleReset,
        handleSubmit,
        modal,
        closeModal,
    } = useRegisterClientForm();

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6 border rounded bg-white shadow space-y-6">
            <h2 className="text-2xl font-bold text-center">Registro de Cliente</h2>

            <FormSection title="Información Personal">
                <InputField name="client_name" label="Nombre" value={form.client_name} onChange={handleChange} />
                <InputField name="client_lastname" label="Apellido" value={form.client_lastname} onChange={handleChange} />
                <InputField name="client_id_card" label="Cédula" value={form.client_id_card} onChange={handleChange} />
            </FormSection>

            <FormSection title="Contacto">
                <InputField type="email" name="client_email" label="Correo electrónico" value={form.client_email} onChange={handleChange} />
                <InputField name="client_phone" label="Teléfono" value={form.client_phone} onChange={handleChange} />
                <InputField name="client_address" label="Dirección" value={form.client_address} onChange={handleChange} />
            </FormSection>

            <FormSection title="Vehículo">
                <InputField name="client_vehicle_plate" label="Placa del Vehículo" value={form.client_vehicle_plate} onChange={handleChange} />
            </FormSection>

            <FormSection title="Paquete">
                {loadingPackages ? (
                    <p className="text-gray-500">Cargando paquetes...</p>
                ) : (
                    <>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="selectedPackage" className="font-medium text-sm">Paquete</label>
                            <select
                                name="selectedPackage"
                                id="selectedPackage"
                                value={form.selectedPackage}
                                onChange={handleChange}
                                className="border px-4 py-2 rounded"
                            >
                                <option value="">Seleccione un paquete</option>
                                {packages.map((pkg) => (
                                    <option key={pkg.pack_id} value={pkg.pack_id}>
                                        {pkg.pack_name} - ₡{pkg.pack_price.toLocaleString("es-CR")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <InputField
                            type="date"
                            name="client_pack_start_date"
                            label="Fecha de inicio"
                            value={form.client_pack_start_date}
                            onChange={handleChange}
                        />
                        <InputField
                            type="date"
                            name="client_pack_end_date"
                            label="Fecha de fin"
                            value={form.client_pack_end_date}
                            onChange={handleChange}
                        />
                    </>
                )}
            </FormSection>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 bg-red-800 hover:bg-red-900 text-white relative overflow-hidden group transition-all duration-300"
                >
                    <span className="relative z-10">LIMPIAR</span>
                    <Paintbrush
                        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:left-[85%] transition-all duration-500 ease-in-out"
                        size={20}
                    />
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden group transition-all duration-300"
                    disabled={loadingPackages}
                >
                    <span className="relative z-10">IR A PAGAR</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:left-[85%] transition-all duration-500 ease-in-out"
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </Button>
            </div>

            {/* Modal para mensajes */}
            <Modal isOpen={modal.isOpen} message={modal.message} onClose={closeModal} />
        </div>
    );
};

const InputField = ({
    label,
    name,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}) => (
    <div className="flex flex-col gap-1">
        <label htmlFor={name} className="font-medium text-sm">{label}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} className="border px-4 py-2 rounded" />
    </div>
);

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="grid md:grid-cols-2 gap-4">
            {children}
        </div>
    </section>
);

export default RegisterClientPage;
