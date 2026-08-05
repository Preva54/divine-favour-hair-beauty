"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ROSE = "#b76e79";
const BLUSH = "#e8a8b8";
const GOLD = "#d4af37";
const MUTED = "#7d6f6a";
const GRID = "#f0ded9";

const STATUS_COLORS: Record<string, string> = {
  PENDING: GOLD,
  CONFIRMED: BLUSH,
  COMPLETED: ROSE,
  CANCELLED: "#b8b0ad",
  NO_SHOW: MUTED,
};

export function RevenueTrendChart({ data }: { data: { month: string; revenue: number; bookings: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: MUTED }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: MUTED }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `R${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(183, 110, 121, 0.08)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #f0ded9", fontSize: 12 }}
            formatter={(value, name) => (name === "Revenue" ? `R${Number(value).toLocaleString()}` : String(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
          <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={ROSE} radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Line yAxisId="right" dataKey="bookings" name="Bookings" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3, fill: GOLD }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BookingStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex h-72 flex-col items-center justify-center gap-2">
      <div className="relative h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={86} paddingAngle={3} strokeWidth={0}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? MUTED} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f0ded9", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-serif text-2xl font-bold text-ink">{total}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">bookings</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {data.map((d) => (
          <span key={d.status} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[d.status] ?? MUTED }} />
            {d.status.toLowerCase()} · {d.count}
          </span>
        ))}
      </div>
    </div>
  );
}
