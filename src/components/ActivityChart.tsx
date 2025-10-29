"use client";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

const data = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 150 },
  { name: "Wed", value: 170 },
  { name: "Thu", value: 160 },
  { name: "Fri", value: 200 },
  { name: "Sat", value: 180 },
  { name: "Sun", value: 220 },
];

export default function ActivityChart() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <span className="text-sm text-gray-400">Last 7 days</span>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow">
          +10%
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E53935" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#E53935" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#888" />
          <YAxis stroke="#888" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#E53935"
            fill="url(#colorRed)"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#E53935", strokeWidth: 2, fill: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
