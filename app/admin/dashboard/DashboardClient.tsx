"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  type LucideIcon,
  LayoutGrid,
  ClipboardList,
  Calculator,
  LogOut,
  RefreshCw,
  Search,
  Download,
  Phone,
  MapPin,
  Globe,
  Trash2,
  Pencil,
  ChevronRight,
  Package,
  Camera,
  Footprints,
  Wrench,
  Layers,
  Speaker,
  CircleDot,
  Paintbrush,
  Wind,
  Armchair,
  Shield,
  MoveVertical,
  Axe,
  Headphones,
  Truck,
  Banknote,
  ShoppingBag,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
  X,
} from "lucide-react";
import { PRODUCTS } from "@/lib/export-products";
import { hasGift } from "@/lib/gift";

const OverviewChart = dynamic(() => import("./OverviewChart"), { ssr: false });
const SkytecPanel = dynamic(() => import("./SkytecPanel"), { ssr: false });
const CodPanel = dynamic(() => import("./CodPanel"), { ssr: false });
const AdnanPanel = dynamic(() => import("./AdnanPanel"), { ssr: false });
const DraftsPanel = dynamic(() => import("./DraftsPanel"), { ssr: false });

type IconCmp = LucideIcon;

type Order = {
  id: string;
  created_at: string;
  order_number?: string;
  ime: string;
  telefon: string;
  adresa: string;
  grad: string;
  ip_address?: string;
  velicine: { velicina: number | string; kolicina: number }[];
  ukupno_pari: number;
  cijena_proizvoda: number;
  dostava: number;
  ukupno: number;
  status: string;
  city_ok?: boolean;
  duplicates?: {
    phone: number;
    ip: number;
    person: number;
    reasons: string[];
    matches?: { id: string; ime: string; telefon: string; grad: string; created_at: string; via: string[] }[];
  } | null;
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
  cetkaCount: number;
  usmjerivacCount: number;
  lezaljkaCount?: number;
  chartData: { date: string; narudžbe: number; prihod: number }[];
};

type Tab = "overview" | "orders" | "skytec" | "otkupnine" | "margins";

// Four statuses only: an order comes in (Nova), goes out with the courier
// (Poslana) and ends as delivered and paid (Isporučena) or returned (Vraćena).
// The old "potvrđena" step is gone (no more phone confirmation); such rows
// show as Nova.
const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  nova:       { label: "Nova",       color: "#C2410C", bg: "#FDEDE7", dot: "#F45B39" },
  poslana:    { label: "Poslana",    color: "#8E5B00", bg: "#FFF4D6", dot: "#FFB020" },
  isporučena: { label: "Isporučena", color: "#1A7F3C", bg: "#E6F6EA", dot: "#34C759" },
  vraćena:    { label: "Vraćena",    color: "#C4161C", bg: "#FDE7E8", dot: "#FF3B30" },
};

const STATUS_OPTIONS = ["nova", "poslana", "isporučena", "vraćena"];

const normStatus = (s: string) => (s === "potvrđena" ? "nova" : s);

const PRODUCT_MAP: Record<string, { label: string; tint: string; ink: string; Icon: IconCmp }> = {
  CRT: { label: "Radne patike", tint: "rgba(255,159,10,0.18)", ink: "#ffd60a", Icon: Footprints },
  KMR: { label: "WiFi kamera", tint: "rgba(191,90,242,0.18)", ink: "#d4a4ff", Icon: Camera },
  MLW: { label: "Milwaukee", tint: "rgba(255,69,58,0.18)", ink: "#ff6961", Icon: Wrench },
  MS3: { label: "Milwaukee set", tint: "rgba(255,69,58,0.18)", ink: "#ff6961", Icon: Wrench },
  S2U: { label: "Set 2u1", tint: "rgba(255,159,10,0.18)", ink: "#ffd60a", Icon: Layers },
  ZQS: { label: "Zvučnik", tint: "rgba(48,209,88,0.16)", ink: "#63e6a0", Icon: Speaker },
  DWL: { label: "DeWalt", tint: "rgba(255,214,10,0.16)", ink: "#ffe066", Icon: Wrench },
  DWT: { label: "DeWalt", tint: "rgba(255,214,10,0.16)", ink: "#ffe066", Icon: Wrench },
  BRS: { label: "Brusilica", tint: "rgba(64,210,255,0.16)", ink: "#64d2ff", Icon: CircleDot },
  CCT: { label: "Čelična četka", tint: "rgba(48,209,88,0.16)", ink: "#63e6a0", Icon: Paintbrush },
  USM: { label: "Usmjerivač zraka", tint: "rgba(10,132,255,0.18)", ink: "#64d2ff", Icon: Wind },
  PAT: { label: "Radne patike", tint: "rgba(94,92,230,0.2)", ink: "#bfbdff", Icon: Footprints },
  RCH: { label: "Richeng", tint: "rgba(255,159,10,0.18)", ink: "#ffd60a", Icon: Footprints },
  AEX: { label: "Aeox Plus", tint: "rgba(48,209,88,0.16)", ink: "#63e6a0", Icon: Footprints },
  HMR: { label: "Hammer", tint: "rgba(255,255,255,0.08)", ink: "#d1d1d6", Icon: Footprints },
  LEZ: { label: "Ležaljka", tint: "rgba(255,55,95,0.16)", ink: "#ff7aa2", Icon: Armchair },
  PRS: { label: "Prsluk", tint: "rgba(10,132,255,0.18)", ink: "#64d2ff", Icon: Shield },
  ZRF: { label: "Žirafa", tint: "rgba(100,210,255,0.14)", ink: "#64d2ff", Icon: MoveVertical },
  MKK: { label: "Makita 1500W", tint: "rgba(0,199,190,0.16)", ink: "#66d4cf", Icon: CircleDot },
  MKB: { label: "Makita brusilica", tint: "rgba(0,199,190,0.16)", ink: "#66d4cf", Icon: CircleDot },
  APP: { label: "AirPods Pro", tint: "rgba(255,255,255,0.08)", ink: "#f5f5f7", Icon: Headphones },
  MTP: { label: "Motorna pila", tint: "rgba(255,159,10,0.18)", ink: "#ff9f0a", Icon: Axe },
};

const AVATAR_TONES = [
  { bg: "#FDEDE7", fg: "#C2410C" },
  { bg: "#F0F0F2", fg: "#1D1D1F" },
  { bg: "#FFF4D6", fg: "#8E5B00" },
  { bg: "#E6F6EA", fg: "#1A7F3C" },
];

function fmt(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(2).replace(".", ",") + " KM";
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit" }) +
    "  " +
    d.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" })
  );
}

function productMeta(orderNumber?: string) {
  const prefix = (orderNumber ?? "").slice(0, 3).toUpperCase();
  return PRODUCT_MAP[prefix] ?? { label: prefix || "Proizvod", tint: "rgba(255,255,255,0.08)", ink: "#a1a1a6", Icon: Package };
}

function getDayKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sarajevo" }).format(new Date(iso));
}

const WEEKDAYS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];
const MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "juli", "august", "septembar", "oktobar", "novembar", "decembar"];

function getDayPretty(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d}. ${MONTHS[m - 1]}`;
}

function copyText(value?: string) {
  if (!value) return;
  navigator.clipboard.writeText(value).catch(() => {});
}

function PhoneBtn({ phone }: { phone: string }) {
  const compact = phone.replace(/\s+/g, "");
  return (
    <button type="button" className="ad-tel" title="Kopiraj telefon" onClick={() => copyText(compact)}>
      {phone}
    </button>
  );
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

function toneFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  return AVATAR_TONES[h];
}

const VIA_LABEL: Record<string, string> = {
  telefon: "Isti telefon",
  osoba: "Isto ime i grad",
  ip: "Isti IP",
};

function fmtDupWhen(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sarajevo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${g("day")}.${g("month")}. u ${g("hour")}:${g("minute")}`;
}

function GiftBadge() {
  return (
    <span
      title="Kupac je odabrao poklon iznenađenja (+5 KM)"
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
        background: "#E6F6EA", color: "#1A7F3C",
      }}
    >
      🎁 Poklon
    </span>
  );
}

function DupBadge({ d }: { d: Order["duplicates"] }) {
  const [tip, setTip] = useState<{ x: number; y: number; above: boolean } | null>(null);

  useEffect(() => {
    if (!tip) return;
    const close = () => setTip(null);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [tip]);

  if (!d) return null;

  const open = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const width = 280;
    const gap = 10;
    let x = r.right + gap;
    if (x + width > window.innerWidth - 12) x = Math.max(12, r.left - width - gap);
    let y = r.top;
    let above = false;
    if (y + 180 > window.innerHeight - 12) {
      above = true;
      y = r.bottom;
    }
    setTip({ x, y, above });
  };

  const matches = d.matches?.length
    ? d.matches
    : (d.reasons ?? []).map((reason, i) => ({
        id: String(i),
        ime: reason,
        telefon: "",
        grad: "",
        created_at: "",
        via: [],
      }));

  return (
    <>
      <button
        type="button"
        className="ad-dup"
        onMouseEnter={(e) => open(e.currentTarget)}
        onMouseLeave={() => setTip(null)}
        onFocus={(e) => open(e.currentTarget)}
        onBlur={() => setTip(null)}
      >
        <AlertTriangle size={12} strokeWidth={2.4} />
        Duplikat
      </button>
      {tip &&
        createPortal(
          <div
            className={`ad-dup-tip${tip.above ? " is-above" : ""}`}
            style={{ left: tip.x, top: tip.y }}
          >
            <div className="ad-dup-tip-kicker">Zašto je duplikat</div>
            {matches.map((m) => (
              <div key={m.id} className="ad-dup-hit">
                {m.created_at ? (
                  <>
                    <strong>{m.ime}</strong>
                    <span>naručio {fmtDupWhen(m.created_at)}</span>
                    <span>
                      telefon {m.telefon}
                      {m.grad ? ` · ${m.grad}` : ""}
                    </span>
                    {m.via.length > 0 && (
                      <em>{m.via.map((v) => VIA_LABEL[v] ?? v).join(" · ")}</em>
                    )}
                  </>
                ) : (
                  <span>{m.ime}</span>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function ProductBadge({ orderNumber, qty }: { orderNumber?: string; qty?: number }) {
  const p = productMeta(orderNumber);
  const Icon = p.Icon;
  return (
    <span className="ad-badge">
      <i>
        <Icon size={11} strokeWidth={2.2} />
      </i>
      {p.label}
      {qty && qty > 1 ? ` ×${qty}` : ""}
    </span>
  );
}

function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const v = normStatus(value);
  const st = STATUS_META[v] ?? { label: v, color: "#6E6E73", bg: "#F0F0F2", dot: "#C7C7CC" };
  return (
    <select
      className="ad-status"
      value={v}
      onChange={(e) => onChange(e.target.value)}
      style={{ background: st.bg, color: st.color, ["--st" as string]: st.dot }}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}

/** Big tap targets for phones: one tap moves the order to the next status. */
function StatusSegment({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const v = normStatus(value);
  return (
    <div className="ad-stseg" role="radiogroup" aria-label="Status narudžbe">
      {STATUS_OPTIONS.map((s) => {
        const m = STATUS_META[s];
        const on = v === s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={on}
            className={on ? "is-on" : ""}
            style={on ? { background: m.bg, color: m.color } : undefined}
            onClick={() => !on && onChange(s)}
          >
            <span className="dot" style={{ background: m.dot }} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="ad-del" onClick={onClick} title="Obriši narudžbu" aria-label="Obriši narudžbu">
      <Trash2 size={16} strokeWidth={2} />
    </button>
  );
}

type OrderFields = { ime: string; telefon: string; adresa: string; grad: string };

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="ad-edit" onClick={onClick} title="Izmijeni narudžbu" aria-label="Izmijeni narudžbu">
      <Pencil size={16} strokeWidth={2} />
    </button>
  );
}

/** Shown next to the city when Skytec won't recognise it (typo): fix it with the pencil. */
function CityWarn({ order }: { order: Order }) {
  if (order.city_ok !== false) return null;
  return <span className="ad-citywarn" title="Skytec ne prepoznaje ovaj grad. Ispravi ga olovkom.">⚠ Skytec ne zna grad</span>;
}

/** Fix a customer's details (typo in city, address or phone) before the parcel goes to Skytec. */
function EditOrderModal({ order, onClose, onSave }: {
  order: Order; onClose: () => void; onSave: (id: string, f: OrderFields) => Promise<string | null>;
}) {
  const [f, setF] = useState<OrderFields>({ ime: order.ime ?? "", telefon: order.telefon ?? "", adresa: order.adresa ?? "", grad: order.grad ?? "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const field = (k: keyof OrderFields, label: string, hint?: string) => (
    <label className="ad-edit-field">
      <span>{label}</span>
      <input value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setErr(null); }} />
      {hint && <small>{hint}</small>}
    </label>
  );
  const save = async () => {
    if (Object.values(f).some((v) => v.trim().length < 2)) { setErr("Popuni sva polja."); return; }
    setSaving(true);
    const e = await onSave(order.id, f);
    setSaving(false);
    if (e) setErr(e); else onClose();
  };
  return createPortal(
    <div className="ad-edit-back" onClick={onClose} role="presentation">
      <div className="ad-edit-box" role="dialog" aria-label="Izmjena narudžbe" onClick={(e) => e.stopPropagation()}>
        <div className="ad-edit-head">
          <div>
            <b>Izmjena narudžbe</b>
            <span>{order.order_number ?? ""}</span>
          </div>
          <button className="ad-edit-x" onClick={onClose} aria-label="Zatvori"><X size={18} /></button>
        </div>
        {field("ime", "Ime i prezime")}
        {field("telefon", "Telefon")}
        {field("adresa", "Adresa", /^MK[BK]-/.test(order.order_number ?? "") ? "Na kraju ostavi poštanski broj, npr. \"Titova 12, 71000\"" : undefined)}
        {field("grad", "Grad", "Piši puni naziv grada, npr. Banja Luka, Sarajevo, Mostar")}
        {err && <p className="ad-edit-err">{err}</p>}
        <div className="ad-edit-foot">
          <button className="ad-edit-cancel" onClick={onClose}>Odustani</button>
          <button className="ad-edit-save" onClick={save} disabled={saving}>{saving ? "Spremam…" : "Spremi"}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function OrderCard({
  order,
  onStatus,
  onDelete,
  onEdit,
}: {
  order: Order;
  onStatus: (id: string, status: string) => void;
  onDelete: (id: string, ime: string) => void;
  onEdit: (o: Order) => void;
}) {
  const tone = toneFor(order.ime);
  return (
    <article className={`ad-card${order.duplicates ? " is-dup" : ""}`}>
      <div className="ad-card-top">
        <div className="ad-card-id">
          <div className="ad-avatar" style={{ background: tone.bg, color: tone.fg }}>
            {initials(order.ime)}
          </div>
          <div>
            <div className="ad-card-name">
              {order.ime}
              <DupBadge d={order.duplicates} />
            </div>
            <div className="ad-card-meta">
              {fmtDate(order.created_at)} · {order.order_number ?? "—"}
            </div>
          </div>
        </div>
        <div className="ad-card-sum">{fmt(order.ukupno)}</div>
      </div>
      <div className="ad-card-rows">
        <div className="ad-row">
          <Phone size={15} strokeWidth={2} />
          <span>
            <PhoneBtn phone={order.telefon} />
          </span>
        </div>
        <div className="ad-row">
          <MapPin size={15} strokeWidth={2} />
          <span>{order.grad} <CityWarn order={order} /></span>
        </div>
        <div className="ad-row">
          <Globe size={15} strokeWidth={2} />
          <span>
            {order.ip_address ? (
              <button className="ad-ip" title="Kopiraj IP" onClick={() => copyText(order.ip_address)}>
                {order.ip_address}
              </button>
            ) : (
              "—"
            )}
          </span>
        </div>
        <div className="ad-row">
          <Package size={15} strokeWidth={2} />
          <ProductBadge orderNumber={order.order_number} qty={order.ukupno_pari} />
          {hasGift(order) && <GiftBadge />}
        </div>
      </div>
      <div className="ad-card-foot">
        <StatusSegment value={order.status} onChange={(v) => onStatus(order.id, v)} />
        <EditBtn onClick={() => onEdit(order)} />
        <DeleteBtn onClick={() => onDelete(order.id, order.ime)} />
      </div>
    </article>
  );
}

function OrderTable({
  orders,
  loading,
  empty,
  onStatus,
  onDelete,
  onEdit,
}: {
  orders: Order[];
  loading?: boolean;
  empty?: string;
  onStatus: (id: string, status: string) => void;
  onDelete: (id: string, ime: string) => void;
  onEdit: (o: Order) => void;
}) {
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>
            {["Datum", "Broj", "Kupac", "Telefon", "Grad", "IP", "Proizvod", "Kol.", "Iznos", "Status", ""].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} className="ad-empty">Učitavanje...</td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={11} className="ad-empty">{empty}</td>
            </tr>
          ) : (
            orders.map((order) => {
              const tone = toneFor(order.ime);
              return (
                <tr key={order.id} className={order.duplicates ? "is-dup" : undefined}>
                  <td style={{ color: "#86868b", whiteSpace: "nowrap", fontSize: 13 }}>{fmtDate(order.created_at)}</td>
                  <td style={{ color: "#86868b", fontSize: 11, fontFamily: "ui-monospace, Menlo, monospace", whiteSpace: "nowrap" }}>
                    {order.order_number ?? "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div className="ad-avatar" style={{ width: 28, height: 28, borderRadius: 9, fontSize: 10, background: tone.bg, color: tone.fg }}>
                        {initials(order.ime)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{order.ime}</span>
                      <DupBadge d={order.duplicates} />
                    </div>
                  </td>
                  <td>
                    <PhoneBtn phone={order.telefon} />
                  </td>
                  <td style={{ color: "#6e6e73" }}>{order.grad} <CityWarn order={order} /></td>
                  <td style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, color: "#86868b", whiteSpace: "nowrap" }}>
                    {order.ip_address ? (
                      <button className="ad-ip" title="Kopiraj IP" onClick={() => copyText(order.ip_address)}>
                        {order.ip_address}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <ProductBadge orderNumber={order.order_number} />
                      {hasGift(order) && <GiftBadge />}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", color: "#86868b" }}>{order.ukupno_pari}</td>
                  <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{fmt(order.ukupno)}</td>
                  <td>
                    <StatusSelect value={order.status} onChange={(v) => onStatus(order.id, v)} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <EditBtn onClick={() => onEdit(order)} />
                      <DeleteBtn onClick={() => onDelete(order.id, order.ime)} />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}


export default function DashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const pageSize = 20;
  const [viewMode, setViewMode] = useState<"sve" | "po_danu">("po_danu");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  // Per-status totals for the filter chips, taken from the unfiltered list.
  const [statusCounts, setStatusCounts] = useState<Record<string, number> | null>(null);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [exportProduct, setExportProduct] = useState("svi");
  const [exportDate, setExportDate] = useState(todayStr);
  const [exportLoading, setExportLoading] = useState<"xexpress" | "skytec" | "csv" | null>(null);

  const runExport = async (courier: "xexpress" | "skytec") => {
    setExportLoading(courier);
    try {
      const res = await fetch(
        `/api/export?courier=${courier}&product=${encodeURIComponent(exportProduct)}&date=${exportDate}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Greška pri eksportu." }));
        alert(err.error ?? "Greška pri eksportu.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const tag = courier === "xexpress" ? "XExpress" : "Skytec";
      a.download = `${tag}_${exportProduct}_${exportDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Greška pri eksportu. Pokušajte ponovo.");
    } finally {
      setExportLoading(null);
    }
  };

  const runCsvExport = async () => {
    setExportLoading("csv");
    try {
      const params = new URLSearchParams({ all: "true" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.status === 401) {
        router.push("/admin");
        return;
      }
      const data = await res.json();
      const list = (data.orders ?? []) as Order[];
      const header = ["Broj narudžbe", "Datum", "Kupac", "Telefon", "Grad", "IP", "Proizvod", "Ukupno", "Status"];
      const escCsv = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const lines = [
        header.join(","),
        ...list.map((o) =>
          [
            escCsv(o.order_number ?? ""),
            escCsv(fmtDate(o.created_at)),
            escCsv(o.ime),
            escCsv(o.telefon),
            escCsv(o.grad),
            escCsv(o.ip_address ?? ""),
            escCsv(productMeta(o.order_number).label + (hasGift(o) ? " + Poklon" : "")),
            escCsv(fmt(o.ukupno)),
            escCsv(o.status),
          ].join(",")
        ),
      ];
      const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `narudzbe_${exportDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Greška pri preuzimanju podataka. Pokušajte ponovo.");
    } finally {
      setExportLoading(null);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    setStats(await res.json());
    setLoadingStats(false);
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const params = new URLSearchParams({ page: String(page), search, status: statusFilter });
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoadingOrders(false);
  }, [page, search, statusFilter, router]);

  const fetchAllOrders = useCallback(async () => {
    setLoadingAll(true);
    const params = new URLSearchParams({ all: "true", search, status: statusFilter });
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    const fetched: Order[] = data.orders ?? [];
    setAllOrders(fetched);
    if (statusFilter === "all" && !search) {
      const c: Record<string, number> = { all: fetched.length };
      for (const o of fetched) {
        const s = normStatus(o.status);
        c[s] = (c[s] ?? 0) + 1;
      }
      setStatusCounts(c);
    }
    if (fetched.length > 0) {
      setExpandedDays((prev) => (prev.size === 0 ? new Set([getDayKey(fetched[0].created_at)]) : prev));
    }
    setLoadingAll(false);
  }, [search, statusFilter, router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    if (viewMode === "sve") fetchOrders();
  }, [fetchOrders, viewMode]);
  useEffect(() => {
    if (viewMode === "po_danu") fetchAllOrders();
  }, [fetchAllOrders, viewMode]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const handleStatusChange = async (id: string, status: string) => {
    const prevStatus = normStatus((allOrders.find((o) => o.id === id) ?? orders.find((o) => o.id === id))?.status ?? "");
    if (prevStatus && prevStatus !== status) {
      setStatusCounts((c) => (c ? { ...c, [prevStatus]: Math.max(0, (c[prevStatus] ?? 1) - 1), [status]: (c[status] ?? 0) + 1 } : c));
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setAllOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const [editing, setEditing] = useState<Order | null>(null);
  const handleEdit = async (id: string, f: OrderFields): Promise<string | null> => {
    const r = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: f }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return j.error ?? "Greška pri spremanju.";
    // Edited city is re-checked against Skytec on the next load; clear the warning meanwhile.
    const apply = (o: Order) => (o.id === id ? { ...o, ...f, city_ok: undefined } : o);
    setOrders((prev) => prev.map(apply));
    setAllOrders((prev) => prev.map(apply));
    return null;
  };

  const handleDelete = async (id: string, ime: string) => {
    if (!window.confirm(`Obrisati narudžbu od "${ime}"?\n\nOva akcija se ne može poništiti.`)) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setAllOrders((prev) => prev.filter((o) => o.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
  };

  const handleStatusFilter = (s: string) => {
    setStatusFilter(s);
    setPage(1);
  };

  const refresh = () => {
    fetchStats();
    if (viewMode === "sve") fetchOrders();
    else fetchAllOrders();
  };

  const totalPages = Math.ceil(total / pageSize);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of allOrders) {
      const key = getDayKey(o.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allOrders]);

  const toggleDay = (key: string) =>
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const TAB_LABELS: Record<Tab, string> = {
    overview: "Pregled",
    orders: "Narudžbe",
    skytec: "Skytec",
    otkupnine: "Otkupnine",
    margins: "Kalkulator",
  };

  const NAV = [
    { tab: "overview" as Tab, label: "Pregled", Icon: LayoutGrid },
    { tab: "orders" as Tab, label: "Narudžbe", Icon: ClipboardList },
    { tab: "skytec" as Tab, label: "Skytec", Icon: Truck },
    { tab: "otkupnine" as Tab, label: "Otkupnine", Icon: Banknote },
    { tab: "margins" as Tab, label: "Kalkulator", Icon: Calculator },
  ];

  const emptyText = search ? "Nema rezultata." : "Nema narudžbi.";

  const productRows = [
    { label: "Radne patike", value: stats?.shoeCount ?? 0, Icon: Footprints, bg: "var(--brand-soft)", fg: "var(--brand-ink)" },
    { label: "WiFi kamera", value: stats?.cameraCount ?? 0, Icon: Camera, bg: "var(--brand-soft)", fg: "var(--brand-ink)" },
    { label: "Čelična četka", value: stats?.cetkaCount ?? 0, Icon: Paintbrush, bg: "var(--brand-soft)", fg: "var(--brand-ink)" },
    { label: "Usmjerivač zraka", value: stats?.usmjerivacCount ?? 0, Icon: Wind, bg: "var(--brand-soft)", fg: "var(--brand-ink)" },
    { label: "Ležaljka", value: stats?.lezaljkaCount ?? 0, Icon: Armchair, bg: "var(--brand-soft)", fg: "var(--brand-ink)" },
  ];

  return (
    <div className="ad">
      <aside className="ad-sidebar">
        <div className="ad-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lisko/lisko-160.webp" alt="" width={40} height={43} />
          <div>
            <div className="ad-logo-name">
              cartly<span>.</span>ba
            </div>
            <div className="ad-logo-sub">Admin panel</div>
          </div>
        </div>
        <nav className="ad-nav">
          {NAV.map(({ tab, label, Icon }) => (
            <button key={tab} className={`ad-nav-btn${activeTab === tab ? " is-on" : ""}`} onClick={() => setActiveTab(tab)}>
              <span className="ad-nav-ico">
                <Icon size={16} strokeWidth={2} />
              </span>
              <span style={{ flex: 1 }}>{label}</span>
              {tab === "orders" && total > 0 && <span className="ad-nav-count">{total}</span>}
            </button>
          ))}
        </nav>
        <div className="ad-logout">
          <button onClick={handleLogout}>
            <LogOut size={16} strokeWidth={2} />
            Odjava
          </button>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-top">
          <h1>{TAB_LABELS[activeTab]}</h1>
          <div className="ad-top-right">
            <div className="ad-live">
              <div className={`ad-dot${(stats?.recentCount ?? 0) > 0 ? " is-on" : ""}`} />
              {loadingStats ? "..." : (stats?.recentCount ?? 0) > 0 ? `${stats!.recentCount} nove` : "Mirno"}
            </div>
            <button className="ad-icon-btn" onClick={refresh} aria-label="Osvježi">
              <RefreshCw size={16} strokeWidth={2} />
              <span>Osvježi</span>
            </button>
            <button className="ad-top-logout" onClick={handleLogout} aria-label="Odjava">
              <LogOut size={16} strokeWidth={2} />
            </button>
          </div>
        </header>

        <main className="ad-content">
          {activeTab === "overview" && (
            <div className="ov">
              <div className="ov-hero">
                <div>
                  <p className="ov-hero-kicker">Prihod danas</p>
                  <p className="ov-hero-value">{loadingStats ? "—" : fmt(stats?.todayRevenue ?? 0)}</p>
                  <p className="ov-hero-sub">{loadingStats ? "" : `${stats?.todayCount ?? 0} narudžb${(stats?.todayCount ?? 0) === 1 ? "a" : "i"}`}</p>
                </div>
                <div className="ov-hero-side">
                  <div className="ov-hero-live">
                    <div className={`ad-dot${(stats?.recentCount ?? 0) > 0 ? " is-on" : ""}`} />
                    {loadingStats
                      ? "..."
                      : (stats?.recentCount ?? 0) > 0
                        ? `${stats!.recentCount} u zadnjih 30 min`
                        : "Mirno"}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="ov-lisko" src="/lisko/lisko-320.webp" alt="Lisko" width={110} height={119} />
                </div>
              </div>

              <div className="ov-status">
                {STATUS_OPTIONS.map((s) => {
                  const m = STATUS_META[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        handleStatusFilter(s);
                        setActiveTab("orders");
                      }}
                    >
                      <span className="ov-status-top">
                        <span className="dot" style={{ background: m.dot }} />
                        {m.label}
                      </span>
                      <b style={{ color: s === "nova" ? m.color : undefined }}>{statusCounts ? statusCounts[s] ?? 0 : "—"}</b>
                      <ChevronRight size={16} strokeWidth={2} className="ov-status-go" />
                    </button>
                  );
                })}
              </div>

              <div className="ov-kpis">
                {[
                  { label: "Ukupno narudžbi", value: loadingStats ? "—" : String(stats?.totalCount ?? 0), sub: "od početka", Icon: ClipboardList },
                  { label: "Ukupni prihod", value: loadingStats ? "—" : fmt(stats?.totalRevenue ?? 0), sub: "svih vremena", Icon: Banknote },
                  { label: "Prosječna narudžba", value: loadingStats ? "—" : fmt(stats?.avgOrder ?? 0), sub: "po narudžbi", Icon: ShoppingBag },
                ].map(({ label, value, sub, Icon }) => (
                  <div key={label} className="ad-stat">
                    <div className="ad-stat-top">
                      <p className="ad-stat-label">{label}</p>
                      <span className="ad-stat-ico" style={{ background: "var(--fill-2)", color: "var(--muted)" }}>
                        <Icon size={15} strokeWidth={2} />
                      </span>
                    </div>
                    <p className="ad-stat-value">{value}</p>
                    <p className="ad-stat-sub">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="ov-split">
                <div className="ad-chart">
                  <div className="ad-chart-head">
                    <h2>Narudžbe</h2>
                    <span>14 dana</span>
                  </div>
                  {loadingStats || !stats ? (
                    <div className="ad-empty" style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      Učitavanje...
                    </div>
                  ) : (
                    <OverviewChart data={stats.chartData} />
                  )}
                </div>

                <div className="ov-products">
                  <h2>Proizvodi</h2>
                  {productRows.map(({ label, value, Icon, bg, fg }) => (
                    <div key={label} className="ov-prod">
                      <span className="ov-prod-ico" style={{ background: bg, color: fg }}>
                        <Icon size={15} strokeWidth={2} />
                      </span>
                      <b>{label}</b>
                      <span>{loadingStats ? "—" : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && <DraftsPanel />}

          {activeTab === "orders" && (
            <div className="ad-panel">
              <div className="ad-toolbar">
                <div className="ad-search">
                  <Search className="ad-search-ico" size={16} strokeWidth={2} />
                  <input
                    type="search"
                    placeholder="Ime, telefon, grad, IP"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button onClick={handleSearch}>Traži</button>
                  {search ? (
                    <button
                      className="ad-btn ghost"
                      onClick={() => {
                        setSearch("");
                        setSearchInput("");
                        setPage(1);
                      }}
                      aria-label="Poništi pretragu"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                <div className="ad-exports">
                  <select value={exportProduct} onChange={(e) => setExportProduct(e.target.value)}>
                    <option value="svi">Svi proizvodi</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} />
                  <button
                    className="ad-export-btn xe"
                    onClick={() => runExport("xexpress")}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === "xexpress" ? <Loader2 className="ad-spin" size={14} /> : <Truck size={14} />}
                    X Express
                  </button>
                  <button
                    className="ad-export-btn sk"
                    onClick={() => runExport("skytec")}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === "skytec" ? <Loader2 className="ad-spin" size={14} /> : <Download size={14} />}
                    Skytec
                  </button>
                  <button
                    className="ad-export-btn csv span-2"
                    onClick={runCsvExport}
                    disabled={exportLoading !== null}
                  >
                    {exportLoading === "csv" ? <Loader2 className="ad-spin" size={14} /> : <FileSpreadsheet size={14} />}
                    Preuzmi CSV
                  </button>
                </div>
              </div>

              <div className="ad-filters">
                <div className="ad-seg">
                  {(["sve", "po_danu"] as const).map((mode) => (
                    <button
                      key={mode}
                      className={viewMode === mode ? "is-on" : ""}
                      onClick={() => {
                        setViewMode(mode);
                        if (mode === "po_danu") setExpandedDays(new Set());
                      }}
                    >
                      {mode === "sve" ? "Lista" : "Po danu"}
                    </button>
                  ))}
                </div>
                <button
                  className={`ad-chip${statusFilter === "all" ? " is-on" : ""}`}
                  onClick={() => handleStatusFilter("all")}
                >
                  Sve
                  {statusCounts && <span className="n">{statusCounts.all}</span>}
                </button>
                {STATUS_OPTIONS.map((s) => {
                  const active = statusFilter === s;
                  const st = STATUS_META[s];
                  return (
                    <button key={s} className={`ad-chip${active ? " is-on" : ""}`} onClick={() => handleStatusFilter(s)}>
                      <span className="dot" style={{ background: st.dot }} />
                      {st.label}
                      {statusCounts && <span className="n">{statusCounts[s] ?? 0}</span>}
                    </button>
                  );
                })}
              </div>

              {viewMode === "sve" ? (
                <>
                  <div className="ad-cards">
                    {loadingOrders ? (
                      <div className="ad-empty">Učitavanje...</div>
                    ) : orders.length === 0 ? (
                      <div className="ad-empty">{emptyText}</div>
                    ) : (
                      orders.map((o) => (
                        <OrderCard key={o.id} order={o} onStatus={handleStatusChange} onDelete={handleDelete} onEdit={setEditing} />
                      ))
                    )}
                  </div>
                  <OrderTable
                    orders={orders}
                    loading={loadingOrders}
                    empty={emptyText}
                    onStatus={handleStatusChange}
                    onDelete={handleDelete}
                    onEdit={setEditing}
                  />
                  {totalPages > 1 && (
                    <div className="ad-pager">
                      <span>
                        Stranica {page} od {totalPages}
                      </span>
                      <div>
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                          ‹
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + idx;
                          return (
                            <button key={p} className={p === page ? "is-on" : ""} onClick={() => setPage(p)}>
                              {p}
                            </button>
                          );
                        })}
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : loadingAll ? (
                <div className="ad-empty">Učitavanje...</div>
              ) : allOrders.length === 0 ? (
                <div className="ad-empty">{emptyText}</div>
              ) : (
                <div className="ad-days">
                  {groupedByDay.map(([dayKey, dayOrders]) => {
                    const isOpen = expandedDays.has(dayKey);
                    const dayTotal = dayOrders.reduce((s, o) => s + o.ukupno, 0);
                    const countLabel =
                      dayOrders.length === 1
                        ? "1 narudžba"
                        : dayOrders.length < 5
                          ? `${dayOrders.length} narudžbe`
                          : `${dayOrders.length} narudžbi`;
                    return (
                      <div key={dayKey} className="ad-day">
                        <button className="ad-day-h" onClick={() => toggleDay(dayKey)}>
                          <ChevronRight
                            size={16}
                            strokeWidth={2.2}
                            style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "0.18s", color: "#86868b" }}
                          />
                          <strong>{getDayPretty(dayKey)}</strong>
                          <em>{countLabel}</em>
                          <b>{fmt(dayTotal)}</b>
                        </button>
                        {isOpen && (
                          <div className="ad-day-body">
                            <div className="ad-cards">
                              {dayOrders.map((o) => (
                                <OrderCard key={o.id} order={o} onStatus={handleStatusChange} onDelete={handleDelete} onEdit={setEditing} />
                              ))}
                            </div>
                            <OrderTable orders={dayOrders} onStatus={handleStatusChange} onDelete={handleDelete} onEdit={setEditing} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "skytec" && <SkytecPanel />}

          {activeTab === "otkupnine" && <CodPanel />}

          {activeTab === "margins" && <AdnanPanel />}
        </main>
      </div>

      {editing && <EditOrderModal order={editing} onClose={() => setEditing(null)} onSave={handleEdit} />}

      <nav className="ad-bottom">
        {NAV.map(({ tab, label, Icon }) => (
          <button key={tab} className={activeTab === tab ? "is-on" : ""} onClick={() => setActiveTab(tab)}>
            <Icon size={22} strokeWidth={activeTab === tab ? 2.2 : 1.8} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
