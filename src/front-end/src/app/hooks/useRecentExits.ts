import { useQuery } from "@tanstack/react-query";
import { colorMap } from "@/lib/colors";

interface ExitRecord {
  id: string;
  plate: string;
  time: string;
  owner: string;
  color: string;
  reference: string;
  status: string;
  selected?: boolean; // Added optional 'selected' property
}

export const useRecentExits = () => {
  const { data: exitRecords = [] } = useQuery<ExitRecord[]>({
    queryKey: ["recentExits"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles/exits");
      if (!res.ok) throw new Error("Error loading recent exits");
      const data = await res.json();

      return data.map((veh: any) => {
        const utcDate = new Date(veh.veh_egress_date);
        const crTime = new Date(utcDate.getTime() - 6 * 60 * 60 * 1000);
        const formattedTime = crTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        return {
          id: veh.veh_id.toString(),
          plate: veh.veh_plate,
          reference: veh.veh_reference,
          owner: veh.veh_owner,
          color: colorMap[veh.veh_color?.toLowerCase()] || "gray",
          time: formattedTime,
          status: "IN",
          selected: false, // Default value for 'selected'
        };
      });
    },
  });

  return {
    exitRecords,
  };
};
