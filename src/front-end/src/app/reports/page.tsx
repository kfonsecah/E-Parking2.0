'use client'
const dynamic1 = 'force-dynamic';
import dynamic from 'next/dynamic'
import { useReportsGeneration } from '@/app/hooks/useReportsGeneration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import wheelAnimation from "@/../public/media/animations/wheel.json";

import { useRef, useEffect } from "react";
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import { LottieRefCurrentProps } from 'lottie-react'


export default function ReportsGeneration() {
  const {
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    vehicles,
    totalCount,
    totalIngressed,
    loading,
    error,
    fetchReport,
    getRange,
    activeRange,
    reportOptions,
  } = useReportsGeneration();
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (loading && lottieRef.current) {
      lottieRef.current.setSpeed(8.5);
    }
  }, [loading]);


  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-300 min-h-screen overflow-x-hidden">
      {/* Título */}
      <h1 className="text-lg md:text-xl font-medium text-teal-600 border-b border-teal-600 pb-1 mb-6 inline-block">
        Generación de reportes
      </h1>




      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* FROM */}
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label className="text-gray-600 text-sm">Desde</label>
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
              <Input
                type="date"
                placeholder="..."
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* TO */}
          <div className="flex flex-col gap-1 w-full sm:w-1/2">
            <label className="text-gray-600 text-sm">Hasta</label>
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
              <Input
                type="date"
                placeholder="..."
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={fetchReport}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
          >
            Generar Reporte
          </Button>

          {/* Espacio reservado fijo para la animación */}
          <div className="w-[60px] h-[60px] relative flex items-center justify-center">

            {loading && (
              <Lottie
                lottieRef={lottieRef}
                animationData={wheelAnimation}
                loop
                initialSegment={[30, 120]}
                style={{
                  width: "100%",
                  height: "100%",
                  transform: "scale(2)",
                  transformOrigin: "center",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Opciones de reporte */}

      <div className="flex gap-4 overflow-x-auto pb-2">
        {reportOptions.map(({ label, description, type }) => (
          <Card
            key={type}
            onClick={() => getRange(type)}
            className={cn(
              "w-[211px] h-[110px] flex-shrink-0 cursor-pointer transition-all duration-200",
              "border border-transparent rounded-[20px]", // 💡 redondeo más suave
              activeRange === type
                ? "outline outline-2 outline-emerald-500 outline-offset-[-2px] shadow-md" // 🔥 outline mejor que ring aquí
                : "hover:shadow-sm"
            )}
          >


            <CardHeader className="items-center text-center pb-0">
              <CardTitle className="text-emerald-600 text-base font-bold">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen del reporte */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold mb-4">Resumen del reporte</h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Métricas */}
          <div className="flex flex-col gap-6 w-full md:w-1/3">
            {/* Total Recaudado */}
            <div className="flex items-center gap-4">
              <div className="bg-teal-100 p-3 md:p-4 rounded-full">
                <Image src="/media/icon_cash.png" alt="Money" width={40} height={40} className="w-10 h-10" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {totalIngressed.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
                </div>
                <div className="text-gray-500 text-sm">Total de ganancias</div>
              </div>
            </div>

            {/* Total de Carros */}
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 md:p-4 rounded-full">
                <Image src="/media/icon_pink_car.png" alt="Cars" width={40} height={40} className="w-10 h-10" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-gray-500 text-sm">Total de carros egresados</div>
              </div>
            </div>
          </div>

          {/* Lista de carros */}
          <div className="bg-gray-100 rounded-lg p-4 w-full md:w-2/3 max-h-[360px] overflow-y-auto">
            <div className="space-y-4 pr-1">
              {vehicles.map((car, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-lg shadow-sm gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: car.color || "gray" }}
                    />
                    <div>
                      <div className="text-gray-400 text-xs">Placa</div>
                      <div className="font-medium text-sm">{car.plate}</div>
                      <div className="text-gray-400 text-xs">Dueño</div>
                      <div className="font-medium text-sm">{car.owner}</div>
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="text-gray-400 text-xs">Fecha de ingreso</div>
                    <div className="font-medium">{car.in}</div>
                    <div className="text-gray-400 text-xs">Fecha de salida</div>
                    <div className="font-medium">{car.out}</div>
                  </div>
                  <div>
                    <div className="bg-teal-100 text-teal-800 font-semibold px-3 py-1 rounded-md text-sm flex items-center gap-1 shadow-sm">
                      <Image src="/media/icon_cash.png" alt="Price" width={16} height={16} className="w-4 h-4" />
                      {car.tax.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
                    </div>
                  </div>
                </div>
              ))}
              {vehicles.length === 0 && !loading && (
                <div className="text-sm text-gray-500 text-center">No hay vehículos en el rango seleccionado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
