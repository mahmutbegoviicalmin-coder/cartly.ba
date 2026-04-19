"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import recharts to avoid SSR issues
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

// ─── Types ───────────────────────────────────────────────────
type Order = {
  id: string;
  created_at: string;
  ime: string;
  telefon: string;
  adresa: string;
  grad: string;
  velicine: { velicina: number; kolicina: number }[];
  ukupno_pari: number;
  cijena_proizvoda: number;
  dostava: number;
  ukupno: number;
  status: string;
};

type Stats = {
  totalCount: number;
  totalRevenue: number;
  todayRevenue: number;
  avgOrder: number;
  recentCount: number;
  chartData: { date: string; narudžbe: number; prihod: number }[];
};

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
}

function fmtShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" });
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  nova:        { bg: "rgba(255,107,0,0.12)", color: "#CC5500" },
  potvrđena:   { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
  poslana:     { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
  isporučena:  { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
};

const STATUS_OPTIONS = ["nova", "potvrđena", "poslana", "isporučena"];

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", flex: "1 1 200px", minWidth: 0 }}>
      <p style={{ fontSize: 13, color: "#999", margin: "0 0 8px", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: "#FF6B00", margin: 0, lineHeight: 1.1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#bbb", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function DashboardClient() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const pageSize = 20;

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    setStats(data);
    setLoadingStats(false);
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const params = new URLSearchParams({ page: String(page), search });
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoadingOrders(false);
  }, [page, search, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const handleStatusChange = async (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    await fetch("/api/admin/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "var(--font-inter), sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #F0F0F0",
        padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
          Cartly <span style={{ color: "#FF6B00", fontSize: 14, fontWeight: 600, letterSpacing: 0 }}>Admin</span>
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: "none", border: "1px solid #E5E5E5", borderRadius: 8,
            padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#666",
            fontFamily: "var(--font-inter), sans-serif", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F5F5"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
        >
          Odjava
        </button>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Section 1: Stats Cards ─────────────────────── */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <StatCard
            label="Ukupno narudžbi"
            value={loadingStats ? "—" : String(stats?.totalCount ?? 0)}
            sub="svih vremena"
          />
          <StatCard
            label="Prihod danas"
            value={loadingStats ? "—" : fmt(stats?.todayRevenue ?? 0)}
            sub="danas"
          />
          <StatCard
            label="Prihod ukupno"
            value={loadingStats ? "—" : fmt(stats?.totalRevenue ?? 0)}
            sub="svih vremena"
          />
          <StatCard
            label="Prosječna narudžba"
            value={loadingStats ? "—" : fmt(stats?.avgOrder ?? 0)}
            sub="po narudžbi"
          />
        </div>

        {/* ── Section 2: Real-time indicator ────────────── */}
        <div style={{
          background: "#fff", borderRadius: 12, padding: "16px 24px",
          marginBottom: 24, display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ position: "relative", width: 12, height: 12, flexShrink: 0 }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: (stats?.recentCount ?? 0) > 0 ? "#22c55e" : "#d1d5db",
            }} />
            {(stats?.recentCount ?? 0) > 0 && (
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "rgba(34,197,94,0.4)",
                animation: "realTimePulse 1.5s ease-in-out infinite",
              }} />
            )}
          </div>
          <span style={{ fontSize: 14, color: "#0A0A0A", fontWeight: 500 }}>
            {loadingStats ? "Učitavanje..." : (
              (stats?.recentCount ?? 0) > 0
                ? `${stats!.recentCount} narudžb${stats!.recentCount === 1 ? "a" : "i"} u posljednjih 30 minuta`
                : "Nema narudžbi u posljednjih 30 minuta"
            )}
          </span>
        </div>

        {/* ── Section 3: Chart ──────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", margin: "0 0 20px" }}>
            Narudžbe — posljednjih 14 dana
          </h2>
          {loadingStats || !stats ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
              Učitavanje...
            </div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtShortDate}
                    tick={{ fontSize: 11, fill: "#999" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#999" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(v) => fmtShortDate(v as string)}
                    formatter={(v: number) => [v, "Narudžbi"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #F0F0F0", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="narudžbe"
                    stroke="#FF6B00"
                    strokeWidth={2.5}
                    dot={{ fill: "#FF6B00", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Section 4: Facebook Ads placeholder ─────── */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", margin: "0 0 16px" }}>
            Facebook Ads
          </h2>
          {process.env.NEXT_PUBLIC_SUPABASE_URL === "tvoj_supabase_url" || !process.env.FACEBOOK_ACCESS_TOKEN ? (
            <div style={{
              border: "2px dashed #E5E5E5", borderRadius: 10, padding: "32px",
              textAlign: "center", color: "#999",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0A", margin: "0 0 8px" }}>
                Poveži Facebook Ads
              </p>
              <p style={{ fontSize: 13, margin: "0 0 16px" }}>
                Dodaj FACEBOOK_APP_ID, FACEBOOK_ACCESS_TOKEN i FACEBOOK_AD_ACCOUNT_ID u env varijable.
              </p>
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block", background: "#1877F2", color: "#fff",
                  padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Otvori Facebook Developers
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <StatCard label="Potrošnja danas" value="—" sub="Facebook Ads" />
              <StatCard label="Klikovi" value="—" sub="Facebook Ads" />
              <StatCard label="CPM" value="—" sub="Facebook Ads" />
              <StatCard label="Purchase events" value="—" sub="Facebook Ads" />
            </div>
          )}
        </div>

        {/* ── Section 5: Orders Table ───────────────────── */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", margin: 0 }}>
              Narudžbe
              {total > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: "#999", marginLeft: 8 }}>({total} ukupno)</span>}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Pretraži po imenu, telefonu, gradu..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{
                  padding: "9px 14px", fontSize: 13, border: "1px solid #E5E5E5",
                  borderRadius: 8, background: "#F9F9F9", outline: "none", width: 260,
                  fontFamily: "var(--font-inter), sans-serif",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B00"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E5E5"; }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: "9px 18px", background: "#FF6B00", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                Pretraži
              </button>
              {search && (
                <button
                  onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  style={{
                    padding: "9px 14px", background: "none", color: "#999",
                    border: "1px solid #E5E5E5", borderRadius: 8, fontSize: 13,
                    cursor: "pointer", fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  ✕ Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #F0F0F0" }}>
                  {["Datum/Vrijeme", "Ime", "Telefon", "Grad", "Veličine", "Iznos", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px", textAlign: "left", fontSize: 11,
                        fontWeight: 600, color: "#999", textTransform: "uppercase",
                        letterSpacing: "0.05em", whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#ccc", fontSize: 14 }}>
                      Učitavanje narudžbi...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#ccc", fontSize: 14 }}>
                      {search ? "Nema rezultata za pretragu." : "Još nema narudžbi."}
                    </td>
                  </tr>
                ) : (
                  orders.map((order, i) => {
                    const sc = STATUS_COLORS[order.status] ?? { bg: "#f5f5f5", color: "#999" };
                    const sizeStr = order.velicine
                      .filter((v) => v.kolicina > 0)
                      .map((v) => `EU${v.velicina}×${v.kolicina}`)
                      .join(", ");
                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: "1px solid #F5F5F5",
                          background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                        }}
                      >
                        <td style={{ padding: "12px", whiteSpace: "nowrap", color: "#666" }}>
                          {fmtDate(order.created_at)}
                        </td>
                        <td style={{ padding: "12px", fontWeight: 600, color: "#0A0A0A" }}>
                          {order.ime}
                        </td>
                        <td style={{ padding: "12px", color: "#0A0A0A" }}>{order.telefon}</td>
                        <td style={{ padding: "12px", color: "#0A0A0A" }}>{order.grad}</td>
                        <td style={{ padding: "12px", color: "#666", fontSize: 12 }}>{sizeStr}</td>
                        <td style={{ padding: "12px", fontWeight: 700, color: "#FF6B00", whiteSpace: "nowrap" }}>
                          {fmt(order.ukupno)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "none",
                              background: sc.bg,
                              color: sc.color,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "var(--font-inter), sans-serif",
                              outline: "none",
                            }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#999" }}>
                Stranica {page} od {totalPages}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "8px 14px", borderRadius: 8, border: "1px solid #E5E5E5",
                    background: page === 1 ? "#F5F5F5" : "#fff", color: page === 1 ? "#ccc" : "#0A0A0A",
                    fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  ← Prethodna
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        padding: "8px 12px", borderRadius: 8,
                        border: p === page ? "none" : "1px solid #E5E5E5",
                        background: p === page ? "#FF6B00" : "#fff",
                        color: p === page ? "#fff" : "#0A0A0A",
                        fontSize: 13, cursor: "pointer", fontWeight: p === page ? 700 : 400,
                        fontFamily: "var(--font-inter), sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "8px 14px", borderRadius: 8, border: "1px solid #E5E5E5",
                    background: page === totalPages ? "#F5F5F5" : "#fff",
                    color: page === totalPages ? "#ccc" : "#0A0A0A",
                    fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  Sljedeća →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes realTimePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
