import { CarFront, Zap, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorStatsProps {
  business: any;
  fleetCount: number;
}

export function VendorStats({ business, fleetCount }: VendorStatsProps) {
  const stats = [
    {
      label: "Fleet Size",
      value: `${fleetCount} Vehicles`,
      icon: CarFront,
      color: "text-blue-600",
      bg: "bg-blue-100/50"
    },
    {
      label: "Booking Type",
      value: "Direct / Instant",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-100/50"
    },
    {
      label: "Showroom Address",
      value: business.address_line,
      icon: MapPin,
      color: "text-purple-600",
      bg: "bg-purple-100/50"
    }
  ].filter(s => s.value);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group"
        >
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-white group-hover:ring-1 group-hover:ring-black/5`}>
              <stat.icon className="h-6 w-6" />
            </div>
            
            <div className="w-full min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-ink-400 mb-1">
                {stat.label}
              </div>
              <div className="text-[15px] font-bold text-ink-900 truncate">
                {stat.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}




