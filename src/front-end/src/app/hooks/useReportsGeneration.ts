"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

export interface Car {
  plate: string;
  owner: string;
  in: string;
  out: string;
  color: string;
  tax: number;
}

export type RangeType = "day" | "week" | "fortnight" | "month" | "year";

export interface ReportRange {
  label: string;
  description: string;
  type: RangeType;
}

export const reportOptions: ReportRange[] = [
  { label: "Día", type: "day", description: "Reporte de hoy" },
  { label: "Semana", type: "week", description: "Últimos 7 días" },
  { label: "Quincena", type: "fortnight", description: "Últimos 15 días" },
  { label: "Mes", type: "month", description: "Últimos 30 días" },
  { label: "Año", type: "year", description: "Últimos 12 meses" },
];

export function useReportsGeneration() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeRange, setActiveRange] = useState<RangeType | null>(null);

  const formatDateTime = useCallback((dateString: string): string => {
    if (!dateString) return "";

    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-");
    const [hourStr, minute] = timePart?.split(":") ?? [];

    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${day}/${month}/${year} ${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
  }, []);

  const { data: reportData = { vehicles: [], totalCountCars: 0, totalIngress: 0 }, isLoading, error, refetch } = useQuery({
    queryKey: ["report", dateFrom, dateTo],
    queryFn: async () => {
      if (!dateFrom || !dateTo) {
        throw new Error("Debe seleccionar una fecha de inicio y fin");
      }

      const res = await fetch(`/api/reports?startDate=${dateFrom}&endDate=${dateTo}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al obtener los datos del reporte");
      }

      return res.json();
    },
    enabled: false, // Fetch manually with refetch
  });

  const vehicles: Car[] = reportData.vehicles.map((v: any) => ({
    plate: v.veh_plate,
    owner: v.veh_owner,
    in: formatDateTime(v.veh_ingress_date),
    out: formatDateTime(v.veh_egress_date),
    color: v.veh_color,
    tax: v.veh_tax || 0,
  }));

  const totalCount = reportData.totalCountCars;
  const totalIngressed = reportData.totalIngress;

const getRange = useCallback(
  (type: RangeType) => {
    const today = new Date();
    const format = (d: Date) => {
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().split("T")[0];
    };

    const from = new Date(today);
    const to = new Date(today);

    switch (type) {
      case "day":
        break;
      case "week":
        from.setDate(today.getDate() - 6);
        break;
      case "fortnight":
        from.setDate(today.getDate() - 14);
        break;
      case "month":
        from.setMonth(today.getMonth() - 1);
        break;
      case "year":
        from.setFullYear(today.getFullYear() - 1);
        break;
    }

    setDateFrom(format(from));
    setDateTo(format(to));
    setActiveRange(type);
    refetch();
  },
  [refetch]
);


  const fetchReport = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    // estado
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    vehicles,
    totalCount,
    totalIngressed,
    loading: isLoading,
    error,

    // acciones
    fetchReport,
    getRange,

    // rango seleccionado y opciones
    activeRange,
    reportOptions,
  };
}
