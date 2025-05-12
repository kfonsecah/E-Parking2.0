"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useChangePassword } from "@/app/hooks/useChangePassword";
import Modal from "@/components/ui/Modal";
import { useLoader } from "@/context/LoaderContext";

const ResetPassword = () => {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { changePassword, loading, error, success, email } = useChangePassword();
    const { setIsLoading } = useLoader();
    const router = useRouter();

    // Verificar que el correo esté presente en la URL
    useEffect(() => {
        if (!email) {
            setModalMessage("Correo no proporcionado en la URL.");
            setIsModalOpen(true);
            setTimeout(() => {
                setIsModalOpen(false);
                router.push("/auth");
            }, 3000);
        }
    }, [email, router]);

    // Manejar mensajes de éxito y error
    useEffect(() => {
        if (error) {
            setModalMessage(error);
            setIsModalOpen(true);
        }

        if (success) {
            setModalMessage(success);
            setIsModalOpen(true);
            setTimeout(() => {
                setIsModalOpen(false);
                router.push("/auth");
            }, 3000);
        }

        setIsLoading(loading);
    }, [error, success, loading, setIsLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setModalMessage("Las contraseñas no coinciden.");
            setIsModalOpen(true);
            return;
        }

        await changePassword(generatedPassword, newPassword);
    };

    return (
        <>
            <Modal message={modalMessage} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="relative flex min-h-screen items-center justify-center bg-gray-100">
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md"></div>
                <Card className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-lg p-8">
                    <CardContent>
                        <h2 className="text-2xl font-bold text-center mb-6">Cambiar Contraseña</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Campo de Contraseña Generada */}
                            <div>
                                <label htmlFor="generatedPassword" className="block mb-2 text-sm font-semibold text-gray-700">
                                    Contraseña Generada
                                </label>
                                <Input
                                    id="generatedPassword"
                                    type="text"
                                    value={generatedPassword}
                                    onChange={(e) => setGeneratedPassword(e.target.value)}
                                    placeholder="Ingresa la contraseña generada"
                                    required
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Campo de Nueva Contraseña */}
                            <div>
                                <label htmlFor="newPassword" className="block mb-2 text-sm font-semibold text-gray-700">
                                    Nueva Contraseña
                                </label>
                                <div className="relative flex items-center">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ingresa tu nueva contraseña"
                                        required
                                        className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 text-gray-500 hover:text-black"
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Campo de Confirmar Contraseña */}
                            <div>
                                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-gray-700">
                                    Confirmar Contraseña
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirma tu nueva contraseña"
                                    required
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Botón para Confirmar Contraseña */}
                            <Button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center" disabled={loading}>
                                <Lock className="mr-2" />
                                Confirmar Contraseña
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default ResetPassword;
