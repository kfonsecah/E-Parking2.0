'use client'
export const dynamic = 'force-dynamic'

import { Search, Camera, Calendar, Paintbrush, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Modal from "@/components/ui/Modal"
import { useVehicleManagement } from "@/app/hooks/useVehicleManagement"
import { useTicketPrinter } from "@/app/hooks/useTicketPrinter";
import { normalizeColor } from "@/lib/normalizeColor";
import { normalizedColorMap } from "@/lib/nromalizedColorMap"
import { useLoader } from "@/context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";
import PlateLoader from "@/components/InlinePlateLoader";
import InlinePlateLoader from "@/components/InlinePlateLoader"


export default function VehicleManagementPage() {
  const { isLoading } = useLoader();
  const {
    router,
    searchQuery,
    setSearchQuery,
    newEntry,
    setNewEntry,
    stats,
    modalOpen,
    modalMessage,
    showModal,
    closeModal,
    filteredEntries,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleReset,
    handleRemoveEntry,
    colorMap,
    recognizePlateFromImage,
    isDetectingPlate,
    setIsDetectingPlate,
  } = useVehicleManagement()

  const { printIngressTicket } = useTicketPrinter();

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <div className="container mx-auto p-4">
      <Modal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={closeModal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left column - Recent Entries */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 w-full">
            <div className="relative mb-4 bg-white p-4 rounded-lg">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-md"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Entradas Recientes</h2>

            <div className="bg-gray-200 rounded-lg p-3 max-h-[520px] min-h-[450px] overflow-y-auto space-y-4">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-lg p-2 relative shadow text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full mr-2" style={{ backgroundColor: entry.color }} />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500">Placa</p>
                            <p className="font-bold">{entry.plate}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">Referencia</p>
                            <p className="font-bold">{entry.reference}</p>
                          </div>

                          <div className="text-right mr-6">
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

                    <div className="flex justify-end mt-2 gap-2 flex-wrap">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-800 hover:bg-red-900 text-xs flex items-center gap-1 px-3"
                        onClick={() => router.push(`/parking/cashier-exit?id=${entry.id}`)}
                      >
                        Salida
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 px-3 text-xs"
                        onClick={() => {
                          const ingressDate = entry.date && entry.time
                            ? `${entry.date}T${entry.time}`
                            : `${newEntry.date}T${newEntry.time}`;

                          console.log("🕓 Fecha y hora enviadas:", ingressDate);

                          printIngressTicket({
                            owner: entry.owner,
                            plate: entry.plate,
                            reference: entry.reference,
                            ingressDate,
                          });
                        }}
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm">No hay entradas registradas.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Stats and Form */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="p-2 flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-purple-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.available}</p>
                  <p className="text-sm text-gray-500">Espacios Disponibles</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-2 flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.occupied}</p>
                  <p className="text-sm text-gray-500">Espacios Ocupados</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entry Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Plate Input with camera */}
                  <div>
                    <label className="block text-gray-500 mb-1">Número de Placa</label>
                    <div className="relative">
                      {isDetectingPlate ? (
                        <InlinePlateLoader />
                      ) : (
                        <Input
                          name="plate"
                          value={newEntry.plate}
                          onChange={handleInputChange}
                          className="w-full pr-10"
                        />
                      )}

                      <input
                        id="cameraInput"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsDetectingPlate(true);
                            recognizePlateFromImage(file).finally(() => setIsDetectingPlate(false));
                          }
                        }}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 group text-teal-500 hover:bg-transparent"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            const input = document.getElementById("cameraInput") as HTMLInputElement | null;
                            input?.click();
                          }
                        }}

                      >
                        <Camera
                          size={20}
                          className="transition-all duration-500 ease-in-out group-hover:rotate-12 group-hover:scale-125 group-hover:text-emerald-400"
                        />
                      </Button>
                    </div>
                  </div>

                  {/* Owner */}
                  <div>
                    <label className="block text-gray-500 mb-1">Propietario del vehículo</label>
                    <Input name="owner" value={newEntry.owner} onChange={handleInputChange} className="w-full" />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-gray-500 mb-1">Hora de ingreso</label>
                    <Input name="time" type="time" value={newEntry.time} onChange={handleInputChange} className="w-full" />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-gray-500 mb-1">Fecha de ingreso</label>
                    <div className="relative">
                      <Input name="date" type="date" value={newEntry.date} onChange={handleInputChange} className="w-full pr-10" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1 text-gray-400 hover:text-gray-600 hover:bg-transparent">

                      </Button>
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-gray-500 mb-1">Color</label>
                    <div className="flex h-10">
                      <Input
                        name="color"
                        value={newEntry.color}
                        onChange={handleInputChange}
                        className="w-full h-full rounded-r-none"
                        placeholder="Ejemplo: rojo, azul"
                      />
                      <div className="w-12 h-full rounded-r-md border border-l-0 border-input flex items-center justify-center bg-white">
                        <div
                          className="w-6 h-6 rounded-full shadow-sm ring-2 ring-gray-500"
                          style={{ backgroundColor: normalizedColorMap[normalizeColor(newEntry.color)] || "gray" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 bg-red-800 hover:bg-red-900 text-white relative overflow-hidden group transition-all duration-300"
                    >
                      <span className="relative z-10">LIMPIAR</span>
                      <Paintbrush className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:left-[85%] transition-all duration-500 ease-in-out" size={20} />
                    </Button>

                    <Button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden group transition-all duration-300"
                    >
                      <span className="relative z-10">REGISTRAR</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:left-[85%] transition-all duration-500 ease-in-out" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  )
}
