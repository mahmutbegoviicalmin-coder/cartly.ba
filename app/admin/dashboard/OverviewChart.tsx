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
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEDF0" />
          <XAxis dataKey="date" tickFormatter={fmtShortDate} tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
          <Tooltip
            labelFormatter={(v) => fmtShortDate(String(v))}
            formatter={(v) => [v, "Narudžbi"]}
            contentStyle={{ borderRadius: 12, border: "none", background: "#fff", fontSize: 13, color: "#1D1D1F", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          />
          <Line
            type="monotone"
            dataKey="narudžbe"
            stroke="#F45B39"
            strokeWidth={2.5}
            dot={{ fill: "#F45B39", r: 3.5, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#F45B39", stroke: "rgba(244,91,57,0.22)", strokeWidth: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
