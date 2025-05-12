"use client";
export const dynamic = 'force-dynamic'

import { useParkingDashboard } from "@/app/hooks/useParkingDashboard";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { useTicketPrinter } from "@/app/hooks/useTicketPrinter";

import { useLoader } from "@/context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";

export default function ParkingDashboard() {
  const { isLoading } = useLoader();

  const {
    entries,
    stats,
    info,
    router,
    handleDelete,
    name,
  } = useParkingDashboard();
  const { printIngressTicket } = useTicketPrinter();


  if (isLoading) {
    return <GlobalLoader />;
  }

  return (

    <div className="min-h-screen overflow-auto">
      <div className="max-w-[1400px] mx-auto p-3 flex flex-col gap-3">

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total de ingresos", value: `₵${stats.ingress}`, icon: "/media/total_rented.png", bg: "bg-teal-100" },
            { label: "Espacios disponibles", value: stats.available, icon: "/media/permitted_cars.png", bg: "bg-purple-100" },
            { label: "Vehículos ingresados", value: stats.vehiclesIngressed, icon: "/media/check-in.svg", bg: "bg-blue-100" },
            { label: "Vehículos en salida", value: stats.onExit, icon: "/media/check-out.svg", bg: "bg-red-100" },
          ].map(({ label, value, icon, bg }, idx) => (
            <div key={idx} className="flex flex-row items-center gap-4 p-4 bg-white rounded-xl shadow">
              <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                <Image src={icon} alt={label} width={48} height={48} className="w-10 h-10 object-contain p-0.5" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold leading-tight">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vehicles list */}
          <div className="lg:col-span-2">
            <Card className="w-full p-4 bg-white shadow rounded-xl flex flex-col">
              <h2 className="text-base font-semibold mb-3">Entradas Recientes</h2>
              <div className="bg-gray-200 rounded-lg p-3 max-h-[600px] overflow-y-auto space-y-4">
                {entries.map((entry, idx) => (
                  <div key={entry.id || idx} className="bg-white rounded-lg p-4 shadow text-sm flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="w-10 h-10 rounded-full mr-4" style={{ backgroundColor: entry.color }} />
                      <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Placa</p>
                            <p className="font-bold">{entry.plate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Referencia</p>
                            <p className="font-bold">{entry.reference}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Hora de ingreso</p>
                            <p className="font-bold">{entry.time}</p>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">Dueño</p>
                          <p className="font-bold">{entry.owner}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-1 px-3 text-xs bg-red-800 text-white hover:bg-red-600"
                        onClick={() => router.push(`/parking/cashier-exit?id=${entry.id}`)}
                      >
                        <span>Dar Salida</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-3 text-xs"
                        onClick={() =>
                          printIngressTicket({
                            owner: entry.owner,
                            plate: entry.plate,
                            reference: entry.reference,
                            ingressDate: `${entry.date}T${entry.time}`, // Combina fecha y hora
                          })
                        }
                      >
                        <Printer size={14} />
                        Imprimir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-3 text-xs text-red-600 border-red-300 hover:text-red-700"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <span>Eliminar</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Parking info */}
          <div>
            <Card className="p-4 bg-white shadow rounded-xl">
              <h2 className="text-base font-semibold mb-3">Información del Parqueo</h2>
              {info.info_image ? (
                <Image
                  src={`data:image/*;base64,${info.info_image}`}
                  alt="Parking Area"
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-md object-cover mb-3"
                />
              ) : (
                <div className="w-full h-[200px] bg-gray-200 rounded-md flex items-center justify-center mb-3">
                  <span className="text-gray-500 text-sm">Sin imagen</span>
                </div>
              )}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Nombre del Parqueo</p>
                  <p className="font-bold">{info.info_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Localización</p>
                  <p className="font-bold">{info.info_location || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Empleado</p>
                  <p className="font-bold">{name}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
