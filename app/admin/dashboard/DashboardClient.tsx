"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Recharts — dynamic to avoid SSR issues
const LineChart       = dynamic(() => import("recharts").then((m) => m.LineChart),       { ssr: false });
const Line            = dynamic(() => import("recharts").then((m) => m.Line),            { ssr: false });
const XAxis           = dynamic(() => import("recharts").then((m) => m.XAxis),           { ssr: false });
const YAxis           = dynamic(() => import("recharts").then((m) => m.YAxis),           { ssr: false });
const CartesianGrid   = dynamic(() => import("recharts").then((m) => m.CartesianGrid),   { ssr: false });
const Tooltip         = dynamic(() => import("recharts").then((m) => m.Tooltip),         { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
type Order = {
  id: string;
  created_at: string;
  order_number?: string;
  ime: string;
  telefon: string;
  adresa: string;
  grad: string;
  velicine: { velicina: number | string; kolicina: number }[];
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
  todayCount: number;
  avgOrder: number;
  recentCount: number;
  shoeCount: number;
  cameraCount: number;
  chartData: { date: string; narudžbe: number; prihod: number }[];
};

type Tab = "overview" | "orders" | "margins";

// ─── Constants ────────────────────────────────────────────────────────────────
const SHOE_SELL_PRICE   = 99.90;
const CAMERA_SELL_PRICE = 129.90;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  nova:       { bg: "rgba(249,115,22,0.15)",  color: "#f97316" },
  potvrđena:  { bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  poslana:    { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  isporučena: { bg: "rgba(74,222,128,0.15)",  color: "#4ade80" },
};

const STATUS_OPTIONS = ["nova", "potvrđena", "poslana", "isporučena"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " KM";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })
  );
}

function fmtShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" });
}

function isCameraOrder(velicine: { velicina: number | string; kolicina: number }[]) {
  return typeof velicine?.[0]?.velicina === "string";
}

// ─── Margin Calculator Card ───────────────────────────────────────────────────
function MarginCard({
  title, productTag, tagColor, sellPrice,
  nabavna, onNabavnaChange,
  dailyOrders, onDailyChange,
  totalOrders,
}: {
  title: string;
  productTag: string;
  tagColor: string;
  sellPrice: number;
  nabavna: number;
  onNabavnaChange: (v: number) => void;
  dailyOrders: number;
  onDailyChange: (v: number) => void;
  totalOrders: number;
}) {
  const marza      = sellPrice - nabavna;
  const marzaPct   = sellPrice > 0 ? (marza / sellPrice) * 100 : 0;
  const marzaColor = marza > 0 ? "#4ade80" : marza < 0 ? "#ef4444" : "#888";
  const totalMarza = totalOrders * marza;

  const monthlyRevenue = dailyOrders * 30 * sellPrice;
  const monthlyCost    = dailyOrders * 30 * nabavna;
  const monthlyMarza   = dailyOrders * 30 * marza;

  return (
    <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid #2a2a2a", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #222", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: `${tagColor}22`, color: tagColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {productTag}
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f7", margin: "10px 0 0", letterSpacing: "-0.01em" }}>{title}</h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#444", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Narudžbi</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#f5f5f7", margin: 0, letterSpacing: "-0.02em" }}>{totalOrders}</p>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Price inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ fontSize: 10, color: "#555", display: "block", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Prodajna cijena
            </label>
            <div style={{ padding: "11px 14px", background: "#111", borderRadius: 8, border: "1px solid #2a2a2a", fontSize: 17, fontWeight: 800, color: "#f97316" }}>
              {fmt(sellPrice)}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 10, color: "#555", display: "block", marginBottom: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Nabavna cijena
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                value={nabavna}
                onChange={(e) => onNabavnaChange(Number(e.target.value))}
                min={0}
                step={0.5}
                style={{
                  flex: 1, padding: "11px 14px", background: "#111", borderRadius: 8,
                  border: "1px solid #3a3a3a", fontSize: 17, fontWeight: 800, color: "#f5f5f7",
                  outline: "none", fontFamily: "var(--font-inter), sans-serif", width: "100%",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#3a3a3a"; }}
              />
              <span style={{ color: "#444", fontSize: 12, flexShrink: 0 }}>KM</span>
            </div>
          </div>
        </div>

        {/* Marža result */}
        <div style={{
          background: "#111", borderRadius: 10, padding: "16px 20px", marginBottom: 16,
          border: `1px solid ${marzaColor}22`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, color: "#444", margin: "0 0 5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Marža / komad</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: marzaColor, margin: 0, letterSpacing: "-0.03em" }}>{fmt(marza)}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 10, color: "#444", margin: "0 0 5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Postotak</p>
              <p style={{ fontSize: 30, fontWeight: 900, color: marzaColor, margin: 0, letterSpacing: "-0.03em" }}>{marzaPct.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Cumulative earned */}
        {totalOrders > 0 && (
          <div style={{
            background: "rgba(74,222,128,0.05)", borderRadius: 10, padding: "12px 18px", marginBottom: 16,
            border: "1px solid rgba(74,222,128,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>Ukupna zarada (svi)</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.02em" }}>{fmt(totalMarza)}</span>
          </div>
        )}

        {/* Monthly projection */}
        <div style={{ borderTop: "1px solid #1f1f1f", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: "#444", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Projekcija / 30 dana
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#555" }}>Narudžbi/dan:</span>
              <input
                type="number"
                value={dailyOrders}
                onChange={(e) => onDailyChange(Math.max(1, Number(e.target.value)))}
                min={1}
                max={200}
                style={{
                  width: 56, padding: "5px 8px", background: "#111",
                  border: "1px solid #2a2a2a", borderRadius: 6,
                  fontSize: 14, fontWeight: 700, color: "#f5f5f7", outline: "none",
                  fontFamily: "var(--font-inter), sans-serif", textAlign: "center",
                }}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              { label: "Prihod", value: fmt(monthlyRevenue), color: "#f97316" },
              { label: "Nabavna", value: fmt(monthlyCost), color: "#ef4444" },
              { label: "Neto", value: fmt(monthlyMarza), color: "#4ade80" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#111", borderRadius: 8, padding: "10px 12px", border: "1px solid #222" }}>
                <p style={{ fontSize: 10, color: "#444", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color, margin: 0, letterSpacing: "-0.01em" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconOrders = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);
const IconMargins = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats]               = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Orders
  const [orders, setOrders]                   = useState<Order[]>([]);
  const [total, setTotal]                     = useState(0);
  const [page, setPage]                       = useState(1);
  const [search, setSearch]                   = useState("");
  const [searchInput, setSearchInput]         = useState("");
  const [statusFilter, setStatusFilter]       = useState("all");
  const [loadingOrders, setLoadingOrders]     = useState(true);
  const pageSize = 20;

  // Margins
  const [shoeNabavna, setShoeNabavna]         = useState(45);
  const [cameraNabavna, setCameraNabavna]     = useState(65);
  const [shoeDailyOrders, setShoeDailyOrders] = useState(3);
  const [cameraDailyOrders, setCameraDailyOrders] = useState(2);

  useEffect(() => {
    const sn = localStorage.getItem("cartly_shoe_nabavna");
    const cn = localStorage.getItem("cartly_camera_nabavna");
    if (sn) setShoeNabavna(Number(sn));
    if (cn) setCameraNabavna(Number(cn));
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) { router.push("/admin"); return; }
    setStats(await res.json());
    setLoadingStats(false);
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const params = new URLSearchParams({ page: String(page), search, status: statusFilter });
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoadingOrders(false);
  }, [page, search, statusFilter, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleSearch = () => { setPage(1); setSearch(searchInput); };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const handleStatusChange = async (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const handleStatusFilter = (s: string) => { setStatusFilter(s); setPage(1); };

  const exportCSV = () => {
    const headers = ["Datum", "Br.narudžbe", "Ime", "Telefon", "Adresa", "Grad", "Proizvod", "Količina", "Iznos(KM)", "Marža(KM)", "Status"];
    const rows = orders.map((o) => {
      const isCam  = isCameraOrder(o.velicine);
      const nabavna = isCam ? cameraNabavna : shoeNabavna;
      const marza  = o.cijena_proizvoda - nabavna * o.ukupno_pari;
      return [
        `"${fmtDate(o.created_at)}"`,
        o.order_number ?? "—",
        `"${o.ime}"`,
        o.telefon,
        `"${o.adresa}"`,
        `"${o.grad}"`,
        isCam ? "V380 Pro Kamera" : "Radne Patike S3",
        o.ukupno_pari,
        o.ukupno.toFixed(2),
        marza.toFixed(2),
        o.status,
      ].join(",");
    });
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `cartly-narudžbe-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / pageSize);

  const TAB_LABELS: Record<Tab, string> = {
    overview: "Pregled",
    orders:   "Narudžbe",
    margins:  "Kalkulator Marže",
  };

  return (
    <>
      <style>{`
        @keyframes realTimePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2); opacity: 0; }
        }
        @keyframes dashIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-sidebar {
          width: 240px; min-height: 100vh;
          background: #0a0a0a; border-right: 1px solid #1a1a1a;
          display: flex; flex-direction: column;
          padding: 24px 14px;
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dash-main    { margin-left: 240px; }
        .dash-hamburger { display: none !important; }
        .dash-overlay { display: none; }
        .stat-grid    { grid-template-columns: repeat(3, 1fr) !important; }
        .margin-grid  { grid-template-columns: repeat(2, 1fr) !important; }
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .dash-sidebar    { transform: translateX(-100%); }
          .dash-sidebar.open { transform: translateX(0); }
          .dash-main       { margin-left: 0 !important; }
          .dash-hamburger  { display: flex !important; }
          .dash-overlay    { display: block; }
          .margin-grid     { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
        select option { background: #1a1a1a; color: #f5f5f7; }
        .nav-btn:hover { color: #d4d4d8 !important; }
        .refresh-btn:hover { color: #f5f5f7 !important; border-color: #3a3a3a !important; }
        .csv-btn:hover { background: #253025 !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#0f0f0f", fontFamily: "var(--font-inter), Inter, sans-serif" }}>

        {/* Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="dash-overlay"
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 99 }}
          />
        )}

        {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
        <div className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
          {/* Logo */}
          <div style={{ padding: "4px 8px 22px", borderBottom: "1px solid #1a1a1a", marginBottom: 14 }}>
            <div style={{ fontSize: 21, fontWeight: 900, color: "#f5f5f7", letterSpacing: "-0.04em", lineHeight: 1 }}>
              cartly<span style={{ color: "#f97316" }}>.</span>ba
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 5 }}>
              Admin Panel
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            {([
              { tab: "overview" as Tab, label: "Pregled",    Icon: IconGrid },
              { tab: "orders"   as Tab, label: "Narudžbe",   Icon: IconOrders },
              { tab: "margins"  as Tab, label: "Kalkulator", Icon: IconMargins },
            ] as const).map(({ tab, label, Icon }) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
                  className="nav-btn"
                  style={{
                    display: "flex", alignItems: "center", gap: 11,
                    width: "100%", padding: "10px 13px", borderRadius: 9,
                    background: active ? "rgba(249,115,22,0.1)" : "transparent",
                    border: active ? "1px solid rgba(249,115,22,0.2)" : "1px solid transparent",
                    color: active ? "#f97316" : "#555",
                    fontSize: 14, fontWeight: active ? 600 : 400,
                    cursor: "pointer", textAlign: "left",
                    fontFamily: "inherit", transition: "all 0.14s",
                  }}
                >
                  <Icon />
                  <span style={{ flex: 1 }}>{label}</span>
                  {tab === "orders" && total > 0 && (
                    <span style={{
                      background: active ? "rgba(249,115,22,0.25)" : "#1f1f1f",
                      color: active ? "#f97316" : "#555",
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    }}>
                      {total}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 11,
                width: "100%", padding: "10px 13px", borderRadius: 9,
                background: "transparent", border: "1px solid transparent",
                color: "#444", fontSize: 14, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.14s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
                e.currentTarget.style.background = "rgba(239,68,68,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#444";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <IconLogout />
              Odjava
            </button>
          </div>
        </div>

        {/* ─── Main ─────────────────────────────────────────────────────────── */}
        <div className="dash-main" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

          {/* Top header */}
          <header style={{
            height: 56, background: "#0a0a0a", borderBottom: "1px solid #1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px", position: "sticky", top: 0, zIndex: 50,
          }}>
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="dash-hamburger"
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: 0, alignItems: "center" }}
            >
              <IconMenu />
            </button>

            {/* Page title */}
            <h1 style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f7", margin: 0, letterSpacing: "-0.02em" }}>
              {TAB_LABELS[activeTab]}
            </h1>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Live pulse */}
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ position: "relative", width: 8, height: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: (stats?.recentCount ?? 0) > 0 ? "#22c55e" : "#2a2a2a" }} />
                  {(stats?.recentCount ?? 0) > 0 && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(34,197,94,0.5)", animation: "realTimePulse 1.5s ease-in-out infinite" }} />
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#444", fontWeight: 500 }}>
                  {loadingStats ? "..." : (stats?.recentCount ?? 0) > 0 ? `${stats!.recentCount} nova` : "Mirno"}
                </span>
              </div>

              {/* Refresh */}
              <button
                onClick={() => { fetchStats(); fetchOrders(); }}
                className="refresh-btn"
                style={{
                  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8,
                  padding: "7px 14px", fontSize: 12, color: "#666", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.14s",
                }}
              >
                <IconRefresh /> Osvježi
              </button>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, padding: "28px", animation: "dashIn 0.3s ease forwards" }}>

            {/* ══════════════════ OVERVIEW ══════════════════ */}
            {activeTab === "overview" && (
              <>
                {/* Stat grid — 6 cards */}
                <div className="stat-grid" style={{ display: "grid", gap: 14, marginBottom: 18 }}>
                  {[
                    { label: "Ukupno narudžbi",    value: loadingStats ? "—" : String(stats?.totalCount ?? 0),     sub: "od početka",    accent: false },
                    { label: "Prihod danas",        value: loadingStats ? "—" : fmt(stats?.todayRevenue ?? 0),     sub: loadingStats ? "" : `${stats?.todayCount ?? 0} narudžb${(stats?.todayCount ?? 0) === 1 ? "a" : "i"} danas`, accent: true },
                    { label: "Ukupni prihod",       value: loadingStats ? "—" : fmt(stats?.totalRevenue ?? 0),     sub: "svih vremena",  accent: false },
                    { label: "Prosječna narudžba",  value: loadingStats ? "—" : fmt(stats?.avgOrder ?? 0),         sub: "po narudžbi",   accent: false },
                    { label: "Patike S3",           value: loadingStats ? "—" : String(stats?.shoeCount ?? 0),     sub: "narudžbi",      accent: false },
                    { label: "V380 Kamera",         value: loadingStats ? "—" : String(stats?.cameraCount ?? 0),   sub: "narudžbi",      accent: false },
                  ].map(({ label, value, sub, accent }) => (
                    <div key={label} style={{ background: "#1a1a1a", borderRadius: 12, padding: "20px 22px", border: "1px solid #242424" }}>
                      <p style={{ fontSize: 10, color: "#484848", margin: "0 0 10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</p>
                      <p style={{ fontSize: 30, fontWeight: 900, color: accent ? "#f97316" : "#f5f5f7", margin: 0, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</p>
                      {sub && <p style={{ fontSize: 12, color: "#3a3a3a", margin: "7px 0 0", fontWeight: 500 }}>{sub}</p>}
                    </div>
                  ))}
                </div>

                {/* Live indicator strip */}
                <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "13px 20px", marginBottom: 18, border: "1px solid #242424", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: (stats?.recentCount ?? 0) > 0 ? "#22c55e" : "#2a2a2a" }} />
                    {(stats?.recentCount ?? 0) > 0 && (
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(34,197,94,0.45)", animation: "realTimePulse 1.5s ease-in-out infinite" }} />
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
                    {loadingStats ? "Učitavanje..." : (stats?.recentCount ?? 0) > 0 ? (
                      <><span style={{ color: "#22c55e", fontWeight: 700 }}>{stats!.recentCount} narudžb{stats!.recentCount === 1 ? "a" : "i"}</span> u posljednjih 30 minuta</>
                    ) : "Nema novih narudžbi u posljednjih 30 minuta"}
                  </span>
                </div>

                {/* Chart */}
                <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "22px 24px", border: "1px solid #242424" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f7", margin: 0, letterSpacing: "-0.01em" }}>Narudžbe — 14 dana</h2>
                    <span style={{ fontSize: 11, color: "#3a3a3a", fontWeight: 500 }}>Posljednjih 14 dana</span>
                  </div>
                  {loadingStats || !stats ? (
                    <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a2a2a", fontSize: 13 }}>
                      Učitavanje...
                    </div>
                  ) : (
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={fmtShortDate}
                            tick={{ fontSize: 11, fill: "#3a3a3a" }}
                            axisLine={false} tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "#3a3a3a" }}
                            axisLine={false} tickLine={false}
                          />
                          <Tooltip
                            labelFormatter={(v) => fmtShortDate(v as string)}
                            formatter={(v) => [v, "Narudžbi"]}
                            contentStyle={{ borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", fontSize: 12, color: "#f5f5f7" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="narudžbe"
                            stroke="#f97316"
                            strokeWidth={2.5}
                            dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: "#f97316", stroke: "rgba(249,115,22,0.3)", strokeWidth: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ══════════════════ ORDERS ══════════════════ */}
            {activeTab === "orders" && (
              <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid #242424", overflow: "hidden" }}>

                {/* Table toolbar */}
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #1f1f1f", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f7", margin: 0 }}>
                    Sve narudžbe
                    {total > 0 && <span style={{ fontSize: 12, color: "#3a3a3a", marginLeft: 8, fontWeight: 400 }}>({total} ukupno)</span>}
                  </h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Pretraži ime, telefon, grad..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      style={{
                        padding: "8px 14px", fontSize: 13, border: "1px solid #2a2a2a",
                        borderRadius: 8, background: "#111", outline: "none", width: 220,
                        fontFamily: "inherit", color: "#f5f5f7", transition: "border-color 0.15s",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }}
                      onBlur={(e)  => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
                    />
                    <button
                      onClick={handleSearch}
                      style={{ padding: "8px 16px", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Traži
                    </button>
                    {search && (
                      <button
                        onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                        style={{ padding: "8px 12px", background: "#222", color: "#666", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                      >✕</button>
                    )}
                    <button
                      onClick={exportCSV}
                      className="csv-btn"
                      style={{
                        padding: "8px 16px", background: "#192319", color: "#4ade80",
                        border: "1px solid #223022", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s",
                      }}
                    >
                      <IconDownload /> CSV
                    </button>
                  </div>
                </div>

                {/* Status filter pills */}
                <div style={{ padding: "12px 24px", borderBottom: "1px solid #1f1f1f", display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {["all", ...STATUS_OPTIONS].map((s) => {
                    const active = statusFilter === s;
                    const st = STATUS_STYLES[s];
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusFilter(s)}
                        style={{
                          padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                          cursor: "pointer", border: "1px solid",
                          background: active ? (st?.bg ?? "rgba(249,115,22,0.15)") : "transparent",
                          color:      active ? (st?.color ?? "#f97316") : "#444",
                          borderColor: active ? ((st?.color ?? "#f97316") + "44") : "#2a2a2a",
                          fontFamily: "inherit", transition: "all 0.14s",
                        }}
                      >
                        {s === "all" ? "Sve" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    );
                  })}
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                        {["Datum", "Br.", "Ime", "Telefon", "Grad", "Proizvod", "Kol.", "Iznos", "Marža", "Status"].map((h) => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#3a3a3a", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrders ? (
                        <tr><td colSpan={10} style={{ padding: "52px", textAlign: "center", color: "#2a2a2a", fontSize: 14 }}>Učitavanje...</td></tr>
                      ) : orders.length === 0 ? (
                        <tr><td colSpan={10} style={{ padding: "52px", textAlign: "center", color: "#2a2a2a", fontSize: 14 }}>{search ? "Nema rezultata." : "Nema narudžbi."}</td></tr>
                      ) : orders.map((order, i) => {
                        const isCam   = isCameraOrder(order.velicine);
                        const nabavna = isCam ? cameraNabavna : shoeNabavna;
                        const marza   = order.cijena_proizvoda - nabavna * order.ukupno_pari;
                        const marzaPct = order.cijena_proizvoda > 0 ? marza / order.cijena_proizvoda * 100 : 0;
                        const st = STATUS_STYLES[order.status] ?? { bg: "rgba(80,80,80,0.1)", color: "#555" };

                        return (
                          <tr
                            key={order.id}
                            style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#151515" }}
                          >
                            <td style={{ padding: "11px 14px", color: "#444", whiteSpace: "nowrap", fontSize: 12 }}>{fmtDate(order.created_at)}</td>
                            <td style={{ padding: "11px 14px", color: "#333", fontSize: 11, fontFamily: "monospace" }}>{order.order_number ?? "—"}</td>
                            <td style={{ padding: "11px 14px", fontWeight: 600, color: "#d4d4d8" }}>{order.ime}</td>
                            <td style={{ padding: "11px 14px", color: "#777" }}>{order.telefon}</td>
                            <td style={{ padding: "11px 14px", color: "#777" }}>{order.grad}</td>
                            <td style={{ padding: "11px 14px" }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
                                background: isCam ? "rgba(129,140,248,0.12)" : "rgba(249,115,22,0.1)",
                                color: isCam ? "#818cf8" : "#f97316",
                                textTransform: "uppercase", letterSpacing: "0.05em",
                              }}>
                                {isCam ? "Kamera" : "Patike"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 14px", color: "#666", textAlign: "center" }}>{order.ukupno_pari}</td>
                            <td style={{ padding: "11px 14px", fontWeight: 700, color: "#f97316", whiteSpace: "nowrap" }}>{fmt(order.ukupno)}</td>
                            <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                              <span style={{ color: marza >= 0 ? "#4ade80" : "#ef4444", fontWeight: 700 }}>{fmt(marza)}</span>
                              <span style={{ color: "#333", fontSize: 11, marginLeft: 4 }}>({marzaPct.toFixed(0)}%)</span>
                            </td>
                            <td style={{ padding: "11px 14px" }}>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{
                                  padding: "5px 10px", borderRadius: 6, border: "none",
                                  background: st.bg, color: st.color,
                                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  fontFamily: "inherit", outline: "none",
                                }}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ padding: "16px 24px", borderTop: "1px solid #1f1f1f", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#3a3a3a" }}>Stranica {page} od {totalPages}</span>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{ padding: "7px 13px", borderRadius: 7, border: "1px solid #2a2a2a", background: page === 1 ? "#111" : "#222", color: page === 1 ? "#2a2a2a" : "#777", fontSize: 12, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                      >←</button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + idx;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            style={{ padding: "7px 12px", borderRadius: 7, border: p === page ? "none" : "1px solid #2a2a2a", background: p === page ? "#f97316" : "#222", color: p === page ? "#fff" : "#777", fontSize: 12, cursor: "pointer", fontWeight: p === page ? 700 : 400, fontFamily: "inherit" }}>
                            {p}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{ padding: "7px 13px", borderRadius: 7, border: "1px solid #2a2a2a", background: page === totalPages ? "#111" : "#222", color: page === totalPages ? "#2a2a2a" : "#777", fontSize: 12, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                      >→</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════ MARGINS ══════════════════ */}
            {activeTab === "margins" && (
              <>
                <p style={{ fontSize: 13, color: "#444", margin: "0 0 20px", lineHeight: 1.6 }}>
                  Unesite nabavnu cijenu da vidite maržu po komadu i projekciju prihoda.
                  Vrijednosti se automatski snimaju u pretraživač.
                </p>
                <div className="margin-grid" style={{ display: "grid", gap: 18 }}>
                  <MarginCard
                    title="Radne Patike S3"
                    productTag="Patike"
                    tagColor="#f97316"
                    sellPrice={SHOE_SELL_PRICE}
                    nabavna={shoeNabavna}
                    onNabavnaChange={(v) => { setShoeNabavna(v); localStorage.setItem("cartly_shoe_nabavna", String(v)); }}
                    dailyOrders={shoeDailyOrders}
                    onDailyChange={setShoeDailyOrders}
                    totalOrders={stats?.shoeCount ?? 0}
                  />
                  <MarginCard
                    title="V380 Pro Kamera 12MP"
                    productTag="Kamera"
                    tagColor="#818cf8"
                    sellPrice={CAMERA_SELL_PRICE}
                    nabavna={cameraNabavna}
                    onNabavnaChange={(v) => { setCameraNabavna(v); localStorage.setItem("cartly_camera_nabavna", String(v)); }}
                    dailyOrders={cameraDailyOrders}
                    onDailyChange={setCameraDailyOrders}
                    totalOrders={stats?.cameraCount ?? 0}
                  />
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
