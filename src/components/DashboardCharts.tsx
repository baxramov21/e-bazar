"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ["#0052ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DashboardLineChart({ data, title }: { data: any[], title: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: 350, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Ma'lumotlar yetarli emas</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: 350, display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24 }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-md)" }}
              labelStyle={{ color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 4 }}
              formatter={(value: any) => [`${Number(value).toLocaleString()} UZS`, "Jami"]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-accent)" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DashboardPieChart({ data, title }: { data: any[], title: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ height: 350, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Ma'lumotlar yetarli emas</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: 350, display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-md)" }}
              formatter={(value: any) => [value, "Soni"]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: "13px", color: "var(--color-text-secondary)", paddingTop: 20 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
