'use client'
export const dynamic = 'force-dynamic'
import Image from "next/image"
import { Eye, EyeOff } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useLoginForm } from '@/app/hooks/useLoginForm'
import { useRouter } from 'next/navigation'

const LogIn = () => {
    const {
        username,
        password,
        showPassword,
        modalMessage,
        isModalOpen,
        setUsername,
        setPassword,
        setShowPassword,
        handleLogin,
        handleGoogleLogin,
        closeModal,
    } = useLoginForm()

    const router = useRouter();

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-100">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-md"></div>
            <div className="relative z-10 p-10 bg-white shadow-xl rounded-lg">
                <div className="flex items-center justify-center mb-4">
                    <Image
                        src="/media/Logo.png"
                        alt="Logo"
                        width={80}
                        height={80}
                        className="h-20 w-20"
                    />
                    <h1 className="title ml-3 text-2xl font-semibold">Bienvenido a Park Xpress</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">Ingresa a tu cuenta</h2>

                    <div>
                        <label htmlFor="username" className="text-sm font-semibold">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese su usuario"
                        />
                    </div>

                    <div className="mt-2">
                        <label htmlFor="password" className="text-sm font-semibold block mb-1">Contraseña</label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-2 pl-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ingrese su contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-gray-500 hover:text-black flex items-center justify-center"
                                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Botón para Recuperar Contraseña */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.push("/password/sending")}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <div className="flex space-x-6 justify-between py-2">
                        <button
                            type="submit"
                            className="w-1/2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Ingresar
                        </button>
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-1/2 p-3 text-black rounded-lg bg-white hover:bg-gray-300 flex items-center justify-center space-x-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.69 1.23 9.19 3.25l6.88-6.88C35.83 2.3 30.21 0 24 0 14.73 0 6.73 5.73 3.05 14.06l7.94 6.17C12.9 13.23 17.95 9.5 24 9.5z" />
                                <path fill="#34A853" d="M46.5 24c0-1.5-.15-2.95-.44-4.35H24v8.3h12.7c-.55 2.95-2.2 5.45-4.7 7.15l7.3 5.65C43.65 36.15 46.5 30.5 46.5 24z" />
                                <path fill="#4A90E2" d="M24 48c6.15 0 11.35-2.05 15.15-5.55l-7.3-5.65c-2.05 1.4-4.65 2.25-7.85 2.25-6.05 0-11.1-3.75-13.05-9.05l-7.94 6.17C6.73 42.28 14.73 48 24 48z" />
                                <path fill="#FBBC05" d="M3.05 14.06C1.1 18.36 0 22.95 0 27.5c0 4.55 1.1 9.14 3.05 13.44l7.94-6.17C9.9 31.25 9 28.2 9 24.5c0-3.7.9-6.75 2.05-9.44L3.05 14.06z" />
                            </svg>
                            <span>Google</span>
                        </button>
                    </div>
                </form>

                <Modal isOpen={isModalOpen} message={modalMessage} onClose={closeModal} />
            </div>
        </div>
    )

}

export default LogIn
