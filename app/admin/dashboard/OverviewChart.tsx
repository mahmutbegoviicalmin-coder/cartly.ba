"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function fmtShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" });
}

export default function OverviewChart({ data }: { data: { date: string; narudžbe: number }[] }) {
  return (
    <div style={{ width: "100%", height: 240, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" />
          <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
          <Tooltip
            labelFormatter={(v) => fmtShortDate(String(v))}
            formatter={(v) => [v, "Narudžbi"]}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "#1c1c1e", fontSize: 13, color: "#f5f5f7" }}
          />
          <Line
            type="monotone"
            dataKey="narudžbe"
            stroke="#0a84ff"
            strokeWidth={2.5}
            dot={{ fill: "#0a84ff", r: 3.5, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#0a84ff", stroke: "rgba(10,132,255,0.25)", strokeWidth: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
