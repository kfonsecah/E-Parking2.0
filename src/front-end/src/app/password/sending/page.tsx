"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { usePasswordRecovery } from "@/app/hooks/usePasswordRecovery";
import { useLoader } from "@/context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";

const PasswordRecovery = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();
    const { sendRecoveryEmail, isLoading, modalMessage, setModalMessage } = usePasswordRecovery();
    const { setIsLoading } = useLoader();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await sendRecoveryEmail(email);
        setEmail("");
        setIsLoading(false);
    };

    const handleCloseModal = () => setModalMessage("");

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-100">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md"></div>
            <Card className="relative z-10 w-full max-w-md bg-white shadow-xl rounded-lg p-8">
                <CardContent>
                    <h2 className="text-2xl font-bold text-center mb-6">Recuperar Contraseña</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                                Correo Electrónico
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ingresa tu correo"
                                required
                                autoFocus
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center">
                            <Mail className="mr-2" />
                            Enviar Enlace de Recuperación
                        </Button>
                    </form>

                    <p
                        className="text-center mt-6 text-sm text-blue-600 cursor-pointer hover:underline"
                        onClick={() => router.push("/auth")}
                    >
                        Regresar al inicio de sesión
                    </p>
                </CardContent>
            </Card>

            {/* Modal de Mensajes */}
            <Modal message={modalMessage} isOpen={!!modalMessage} onClose={handleCloseModal} />

            {/* Loader */}
            {isLoading && <GlobalLoader />}
        </div>
    );
};

export default PasswordRecovery;
