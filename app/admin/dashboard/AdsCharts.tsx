"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SERIES = "#2a78d6";
const shortDay = (d: string) => `${Number(d.slice(8, 10))}.${Number(d.slice(5, 7))}.`;

/** One measure per chart (spend, purchases): never two y-axes. */
export function DayBars({
  data, dataKey, format, label,
}: {
  data: { date: string; spend: number; purchases: number }[];
  dataKey: "spend" | "purchases";
  format: (n: number) => string;
  label: string;
}) {
  return (
    <div className="kx-chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="#EEEEF0" />
          <XAxis dataKey="date" tickFormatter={shortDay} tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
          <YAxis
            allowDecimals={dataKey === "spend"} tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} width={44}
            tickFormatter={(v) => (dataKey === "spend" ? `$${v}` : String(v))}
          />
          <Tooltip
            cursor={{ fill: "rgba(42,120,214,0.08)" }}
            labelFormatter={(v) => shortDay(String(v))}
            formatter={(v) => [format(Number(v)), label]}
            contentStyle={{ borderRadius: 10, border: "none", fontSize: 13, color: "#1D1D1F", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          />
          <Bar dataKey={dataKey} fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
