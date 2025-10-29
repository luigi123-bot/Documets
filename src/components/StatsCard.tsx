import React from "react";

interface StatsCardProps {
  label: string;
  value: string;
  icon?: string;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start gap-2 min-h-[120px]">
      <div className="text-3xl">{icon}</div>
      <div className="text-2xl font-bold text-[#E53935]">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
