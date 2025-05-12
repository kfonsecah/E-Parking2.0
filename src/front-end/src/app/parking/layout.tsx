

import ParkingTabs from "@/components/ui/ParkingNavBar";

export default function ParkingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <ParkingTabs />
      <div className="p-4">{children}</div>
    </div>
  );
}
