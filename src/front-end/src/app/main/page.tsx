"use client";
export const dynamic = 'force-dynamic'

import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useDashboardManagement } from "@/app/hooks/useDashboardManagement";
import { useEffect, useState } from "react";
import { TooltipProps } from "recharts";
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

                    {/* Tarjeta Realizar Ingreso */}
                    <Card className="overflow-hidden h-[130px] relative rounded-xl cursor-pointer transition-transform hover:scale-[1.01] hover:brightness-105 active:scale-95"
                        onClick={() => router.push(`/parking/entry`)}>
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
                        onClick={() => router.push(`/parking/cashier-exit`)}>

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
                        onClick={() => router.push(`/reports`)}>
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
                                    />
                                ))
                            )}
                        </div>
                    </Card>


                </div>

            </div>
        </div>

    );
}

function NotaItem({
    texto,
    autor,
    fecha,
}: {
    texto: string;
    autor: string;
    fecha: string;
}) {
    const esReciente = (() => {
        const creada = new Date(fecha).getTime();

        // Ajustar hora actual a UTC-6 (Costa Rica)
        const ahoraUTC = new Date();
        const ahoraCR = new Date(ahoraUTC.getTime() - 6 * 60 * 60 * 1000);

        const diffMin = (ahoraCR.getTime() - creada) / 1000 / 60;
        return diffMin <= 15;
    })();


    return (
        <div className="bg-white border border-gray-100 rounded-md p-4 shadow-sm border-l-4 border-l-green-300">
            <div className="flex items-center gap-2 mb-2">
                {esReciente && (
                    <span className="bg-green-200 text-green-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        Nuevo
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-800 mb-2">{texto}</p>
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
