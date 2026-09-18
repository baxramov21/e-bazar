"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const gmvData = [
  { name: "Dushanba", gmv: 0 },
  { name: "Seshanba", gmv: 0 },
  { name: "Chorshanba", gmv: 0 },
  { name: "Payshanba", gmv: 42000000 },
  { name: "Juma", gmv: 156000000 },
  { name: "Shanba", gmv: 0 },
  { name: "Yakshanba", gmv: 0 },
];

const categoryData = [
  { name: "Qishloq xo'jaligi", value: 12 },
  { name: "Sabzavotlar", value: 5 },
  { name: "Qurilish", value: 3 },
  { name: "Sanoat", value: 1 },
];

export default function AdminAnalyticsPage() {
  return (
    <main className="fade-in" style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24 }}>Analitika va Statistika</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        
        {/* GMV Area Chart */}
        <div className="card" style={{ height: 400 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24 }}>Haftalik GMV O'sishi</h2>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={gmvData}>
              <defs>
                <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
              <Tooltip 
                contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
                formatter={(value: number) => [`${value.toLocaleString()} UZS`, "GMV"]}
              />
              <Area type="monotone" dataKey="gmv" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorGmv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Categories Bar Chart */}
        <div className="card" style={{ height: 400 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 24 }}>Kategoriyalar bo'yicha talab</h2>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }} />
              <Bar dataKey="value" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </main>
  );
}
