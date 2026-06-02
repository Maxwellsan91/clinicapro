"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ── Gráfico de Faturamento Mensal ─────────────────────────────────────
interface FaturamentoData { label: string; valor: number }

export function FaturamentoChart({ data }: { data: FaturamentoData[] }) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `${v}€`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={50} />
        <Tooltip
          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
          labelStyle={{ color: "#475569", fontWeight: 600 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [fmt(v as number), "Faturado"]}
        />
        <Area type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradFat)" dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Gráfico de Atendimentos por Dia ──────────────────────────────────
interface AtendData { label: string; atendimentos: number }

export function AtendimentosChart({ data }: { data: AtendData[] }) {
  // Mostrar só cada 5º label para não sobrepor
  const tickFormatter = (_: string, index: number) =>
    index % 5 === 0 ? data[index]?.label ?? "" : "";

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={8}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={tickFormatter} interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [v as number, "Atendimentos"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
          labelStyle={{ color: "#475569", fontWeight: 600 }}
        />
        <Bar dataKey="atendimentos" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === data.length - 1 ? "#2563eb" : "#bfdbfe"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Top Serviços ──────────────────────────────────────────────────────
interface RankingData { nome: string; total: number }

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

export function TopServicosChart({ data }: { data: RankingData[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="space-y-3">
      {data.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">Sem dados este mês</p>
      )}
      {data.map((item, i) => (
        <div key={item.nome} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 truncate max-w-[70%]">{item.nome}</span>
            <span className="font-semibold text-slate-900">{item.total}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((item.total / max) * 100)}%`,
                backgroundColor: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Top Colaboradores ─────────────────────────────────────────────────
export function TopColaboradoresChart({ data }: { data: RankingData[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 120)}>
      <BarChart layout="vertical" data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category" dataKey="nome" width={110}
          tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false}
          tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + "…" : v}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [v as number, "Atendimentos"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Bar dataKey="total" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

