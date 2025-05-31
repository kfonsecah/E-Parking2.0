"use client";
export const dynamic = 'force-dynamic';

import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useDashboardManagement } from "@/app/hooks/useDashboardManagement";
import { useLoader } from "@/context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";

export default function Dashboard() {
    const { router, name, role, notas, loadingNotas } = useDashboardManagement();
    const { isLoading } = useLoader();

    if (isLoading) {
        return <GlobalLoader />;
    }

    return (
        <div className="flex flex-col w-full px-6 py-4 gap-4 bg-transparent min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-4">
                    {/* Tarjeta de bienvenida */}
                    <Card className="overflow-hidden h-[180px] rounded-[16px] relative shadow">
                        <Image
                            src="/media/fondo-dashboard.png"
                            alt="Fondo bienvenida"
                            fill
                            className="absolute inset-0 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                        <div className="absolute bottom-0 left-0 right-0 z-20 px-5 py-4 text-white">
                            <h1 className="text-xl font-bold leading-none">Bienvenido, {name}</h1>
                            <p className="text-white/80 text-sm">{role}</p>
                        </div>
                    </Card>
                    {/* Columna derecha */}

                    {/* Tarjeta Realizar Ingreso */}
                    <Card className="overflow-hidden h-[130px] relative rounded-xl cursor-pointer transition-transform hover:scale-[1.01] hover:brightness-105 active:scale-95"
                        onClick={() => router.push("/parking/entry")}>
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,#00344A_24%,#19868B_100%)]">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute right-0 w-40 h-40 rounded-full bg-teal-400 translate-x-1/3" />
                            </div>
                        </div>
                        <div className="relative z-10 h-full w-full flex flex-col items-start justify-center px-6 text-white">
                            <div className="bg-white/30 p-2 rounded-md mb-2">
                                <Image
                                    src="/media/check-in-white.png"
                                    alt="Icono ingreso"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-lg font-semibold">Realizar Ingreso</h2>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Image
                                src="/media/check-in-white.png"
                                alt="Decoración ingreso"
                                width={80}
                                height={80}
                                className="object-contain origin-bottom-right scale-[1.9] translate-x-1/3 translate-y-1/3"

                            />
                        </div>
                    </Card>

                    {/* Tarjeta Realizar Salida */}
                    <Card className="overflow-hidden h-[130px] relative rounded-xl cursor-pointer transition-transform hover:scale-[1.01] hover:brightness-105 active:scale-95"
                        onClick={() => router.push("/parking/cashier-exit")}>

                        <div className="absolute inset-0 bg-[linear-gradient(to_top,#00344A_24%,#19868B_100%)]">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute right-0 w-40 h-40 rounded-full bg-teal-400 translate-x-1/3" />
                            </div>
                        </div>
                        <div className="relative z-10 h-full w-full flex flex-col items-start justify-center px-6 text-white">
                            <div className="bg-white/30 p-2 rounded-md mb-2">
                                <Image
                                    src="/media/check-out-white.png"
                                    alt="Icono salida"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-lg font-semibold">Realizar Salida</h2>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Image
                                src="/media/check-out-white.png"
                                alt="Decoración salida"
                                width={80}
                                height={80}
                                className="object-contain origin-bottom-right scale-[1.9] translate-x-1/3 translate-y-1/4"

                            />
                        </div>
                    </Card>

                    {/* Tarjeta Reportes */}
                    <Card className="overflow-hidden h-[130px] relative rounded-xl cursor-pointer transition-transform hover:scale-[1.01] hover:brightness-105 active:scale-95"
                        onClick={() => router.push("/reports")}>
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,#00344A_24%,#19868B_100%)]">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute right-0 w-40 h-40 rounded-full bg-teal-400 translate-x-1/3" />
                            </div>
                        </div>
                        <div className="relative z-10 h-full w-full flex flex-col items-start justify-center px-6 text-white">
                            <div className="bg-white/30 p-2 rounded-md mb-2">
                                <Image
                                    src="/media/reports-white.png"
                                    alt="Icono reportes"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-lg font-semibold">Reportes</h2>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Image
                                src="/media/reports-white.png"
                                alt="Decoración reportes"
                                width={80}
                                height={80}
                                className="object-contain origin-bottom-right scale-[2.0] translate-x-1/3 translate-y-0/9"

                            />
                        </div>
                    </Card>

                </div>

                {/* Columna derecha */}
                <div className="md:col-span-2">
                    <Card className="rounded-[16px] shadow px-6 py-5 bg-white">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notas Importantes</h2>
                        <div className="bg-gray-100 p-3 rounded-lg max-h-[510px] overflow-y-auto space-y-3">
                            {loadingNotas ? (
                                <p className="text-sm text-gray-500">Cargando notas...</p>
                            ) : notas.length === 0 ? (
                                <p className="text-sm text-gray-500">No hay notas disponibles.</p>
                            ) : (
                                notas.map((nota) => (
                                    <NotaItem
                                        key={nota.id}
                                        texto={nota.contenido}
                                        autor={nota.usuario}
                                        fecha={nota.fecha}
                                        expiracion={nota.expiracion}
                                        estado={nota.estado}
                                        color={nota.color}
                                    />
                                ))
                            )}
                        </div>
                    </Card>

                </div>
            </div>
        </div >
    );
}

function NotaItem({
    texto,
    autor,
    fecha,
    expiracion,
    estado,
    color,
}: {
    texto: string;
    autor: string;
    fecha: string;
    expiracion?: string;
    estado: string;
    color: string;
}) {

    const borderColor =
        color === "green"
            ? "border-l-green-400"
            : color === "yellow"
                ? "border-l-yellow-400"
                : color === "red"
                    ? "border-l-red-400"
                    : "border-l-gray-400";

    return (
        <div className={`bg-white border rounded-md p-4 shadow-sm ${borderColor}`}>
            <div className="flex items-center gap-2 mb-2">
                <span
                    className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${color === "green"
                        ? "bg-green-100 text-green-700"
                        : color === "yellow"
                            ? "bg-yellow-100 text-yellow-700"
                            : color === "red"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                >
                    {estado}
                </span>
            </div>
            <p className="text-sm text-gray-800 mb-2">{texto}</p>
            {expiracion && (
                <p className="text-xs text-gray-500 mb-2">Expira: {new Date(expiracion).toLocaleDateString()}</p>
            )}
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <div className="bg-gray-800 h-full w-full flex items-center justify-center text-white text-xs font-bold">
                        {autor.charAt(0).toUpperCase()}
                    </div>
                </Avatar>
                <span className="text-xs text-gray-500 font-medium">{autor}</span>
            </div>
        </div>
    );
}
