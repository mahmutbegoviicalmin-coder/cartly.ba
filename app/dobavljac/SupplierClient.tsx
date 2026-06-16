"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_DELIVERY = 10.70;

const PRODUCTS = [
  "DeWalt Bušilica",
  "Milwaukee Bušilica",
  "Milwaukee Brusilica",
  "Čelična Četka",
  "Kamera",
  "Mašina za šišanje",
  "Zvučnik",
  "Komarnik za vrata",
  "Usmjerivač zraka",
];

const STATUS_OPTIONS = [
  { value: "pripremljeno",      label: "Pripremljeno",       color: "#f59e0b", bg: "#fffbeb" },
  { value: "poslano",           label: "Poslano",            color: "#f97316", bg: "#fff7ed" },
  { value: "isporučeno",       label: "Isporučeno",         color: "#10b981", bg: "#ecfdf5" },
  { value: "povrat",            label: "Povrat",             color: "#ef4444", bg: "#fef2f2" },
  { value: "djelimican_povrat", label: "Djelimičan povrat", color: "#f97316", bg: "#fff7ed" },
];

function statusStyle(val: string) {
  return STATUS_OPTIONS.find((o) => o.value === val) ?? { color: "#6b7280", bg: "#f9fafb", label: val };
}

type Item = { product_name: string; quantity: number; unit_price: number; delivery_per_unit: number; _qtyStr?: string; _priceStr?: string; _deliveryStr?: string };
type Shipment = {
  id: string; date: string; status: string; notes: string; photo_url: string | null;
  delivery_cost: number; total_products: number; total: number; placeno: boolean;
  supplier_shipment_items: { product_name: string; quantity: number; unit_price: number }[];
};
type Order = {
  ime: string; telefon: string; adresa: string; grad: string;
  ukupno: number; order_number: string; status: string; proizvod: string;
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const IcoBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoChevron = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .18s" }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcoTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const IcoPhoto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IcoLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IcoTruck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

// ── Reusable input style ───────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "#fff", border: "1.5px solid #e5e7eb",
  borderRadius: 8, color: "#111827", fontSize: 14,
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  transition: "border-color .15s",
};

export default function SupplierClient() {
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authErr, setAuthErr]     = useState("");
  const [activeTab, setActiveTab] = useState<"shipments" | "customers" | "export">("shipments");

  // ── Shipments state ──
  const [shipments, setShipments]     = useState<Shipment[]>([]);
  const [loadingS, setLoadingS]       = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [photoModal, setPhotoModal]   = useState<string | null>(null);

  // ── Form ──
  const [formDate, setFormDate]     = useState(new Date().toISOString().slice(0, 10));
  const [formStatus, setFormStatus] = useState("pripremljeno");
  const [formNotes, setFormNotes]   = useState("");
  const [formPhoto, setFormPhoto]   = useState<string | null>(null);
  const [formItems, setFormItems]   = useState<Item[]>([
    { product_name: "", quantity: 1, unit_price: 0, _qtyStr: "1", _priceStr: "" },
  ]);

  // ── Customers state ──
  const [custDate, setCustDate]     = useState(new Date().toISOString().slice(0, 10));
  const [orders, setOrders]         = useState<Order[]>([]);
  const [loadingO, setLoadingO]     = useState(false);
  const [custFetched, setCustFetched] = useState(false);

  // ── Export state ──
  const [expDate, setExpDate]       = useState(new Date().toISOString().slice(0, 10));
  const [expLoading, setExpLoading] = useState(false);

  // ── Auth ──
  useEffect(() => {
    const saved = sessionStorage.getItem("supplier_pwd");
    if (saved) { setPassword(saved); doAuth(saved); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function doAuth(pwd: string) {
    fetch("/api/supplier/shipments", { headers: { "x-supplier-password": pwd } })
      .then((r) => {
        if (!r.ok) { setAuthErr("Pogrešna lozinka."); sessionStorage.removeItem("supplier_pwd"); return; }
        sessionStorage.setItem("supplier_pwd", pwd);
        setAuthed(true); setAuthErr("");
        r.json().then(setShipments);
        setLoadingS(false);
      });
  }

  function login() { setLoadingS(true); doAuth(password); }

  // ── Fetch shipments ──
  const fetchShipments = useCallback(async () => {
    const res = await fetch("/api/supplier/shipments", { headers: { "x-supplier-password": password } });
    if (res.ok) setShipments(await res.json());
  }, [password]);

  // ── Fetch customers ──
  async function fetchOrders(d: string) {
    setLoadingO(true); setCustFetched(false);
    const res = await fetch(`/api/supplier/orders?date=${d}`, { headers: { "x-supplier-password": password } });
    if (res.ok) setOrders(await res.json());
    setLoadingO(false); setCustFetched(true);
  }

  // ── Form helpers ──
  function resetForm() {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormStatus("pripremljeno"); setFormNotes(""); setFormPhoto(null);
    setFormItems([{ product_name: "", quantity: 1, unit_price: 0, delivery_per_unit: DEFAULT_DELIVERY, _qtyStr: "1", _priceStr: "", _deliveryStr: String(DEFAULT_DELIVERY) }]);
    setEditingId(null);
  }

  function openEdit(s: Shipment) {
    setFormDate(s.date); setFormStatus(s.status); setFormNotes(s.notes ?? ""); setFormPhoto(s.photo_url);
    const itemCount = s.supplier_shipment_items.length || 1;
    const deliveryPerItem = itemCount > 0 ? (s.delivery_cost ?? DEFAULT_DELIVERY) / itemCount : DEFAULT_DELIVERY;
    setFormItems(
      s.supplier_shipment_items.length > 0
        ? s.supplier_shipment_items.map((i) => ({ ...i, delivery_per_unit: deliveryPerItem, _qtyStr: String(i.quantity), _priceStr: String(i.unit_price), _deliveryStr: String(deliveryPerItem.toFixed(2)) }))
        : [{ product_name: "", quantity: 1, unit_price: 0, delivery_per_unit: DEFAULT_DELIVERY, _qtyStr: "1", _priceStr: "", _deliveryStr: String(DEFAULT_DELIVERY) }]
    );
    setEditingId(s.id); setShowForm(true);
  }

  function updateItem(idx: number, field: "product_name" | "_qtyStr" | "_priceStr" | "_deliveryStr", value: string) {
    setFormItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      if (field === "_qtyStr") {
        const n = parseInt(value);
        return { ...item, _qtyStr: value, quantity: isNaN(n) || n < 1 ? item.quantity : n };
      }
      if (field === "_priceStr") {
        const n = parseFloat(value);
        return { ...item, _priceStr: value, unit_price: isNaN(n) ? item.unit_price : n };
      }
      if (field === "_deliveryStr") {
        const n = parseFloat(value);
        return { ...item, _deliveryStr: value, delivery_per_unit: isNaN(n) ? item.delivery_per_unit : n };
      }
      return { ...item, product_name: value };
    }));
  }

  async function handlePhoto(file: File) {
    setPhotoUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/supplier/upload", { method: "POST", headers: { "x-supplier-password": password }, body: fd });
    if (res.ok) { const { url } = await res.json(); setFormPhoto(url); }
    setPhotoUploading(false);
  }

  async function save() {
    setSaving(true);
    const validItems = formItems.filter((i) => i.product_name.trim());
    const delivery_cost = validItems.reduce((s, i) => s + i.quantity * i.delivery_per_unit, 0);
    const body = {
      date: formDate, status: formStatus, notes: formNotes, photo_url: formPhoto,
      delivery_cost,
      items: validItems.map((i) => ({
        product_name: i.product_name, quantity: i.quantity, unit_price: i.unit_price,
      })),
    };
    if (editingId) {
      await fetch(`/api/supplier/shipments/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-supplier-password": password }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/supplier/shipments", { method: "POST", headers: { "Content-Type": "application/json", "x-supplier-password": password }, body: JSON.stringify(body) });
    }
    await fetchShipments(); setShowForm(false); resetForm(); setSaving(false);
  }

  async function deleteShipment(id: string) {
    if (!confirm("Obrisati ovu pošiljku?")) return;
    await fetch(`/api/supplier/shipments/${id}`, { method: "DELETE", headers: { "x-supplier-password": password } });
    fetchShipments();
  }

  async function exportPosta() {
    setExpLoading(true);
    const res = await fetch(`/api/export/posta?date=${expDate}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `Posiljke_${expDate}.xlsx`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const err = await res.json().catch(() => ({ error: "Greška" }));
      alert(err.error ?? "Greška pri exportu.");
    }
    setExpLoading(false);
  }

  const formTotal = formItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const formDelivery = formItems.reduce((s, i) => s + i.quantity * i.delivery_per_unit, 0);

  // ── Login ────────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", padding: "44px 40px", width: "100%", maxWidth: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff" }}>
              <IcoLock />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#111827" }}>Dobavljač Portal</h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0" }}>cartly.ba · Unesi lozinku za pristup</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="password" style={{ ...inp, padding: "13px 14px", fontSize: 15 }}
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Lozinka"
              onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
            />
            {authErr && <p style={{ color: "#ef4444", fontSize: 13, margin: 0, textAlign: "center" }}>{authErr}</p>}
            <button
              onClick={login}
              style={{ padding: "13px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Prijavi se
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── App ──────────────────────────────────────────────────────────────────────
  const TAB_ITEMS = [
    { id: "shipments" as const, label: "Pošiljke",  Icon: IcoBox },
    { id: "customers" as const, label: "Kupci",     Icon: IcoUsers },
    { id: "export"    as const, label: "Export",    Icon: IcoDownload },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Photo modal */}
      {photoModal && (
        <div onClick={() => setPhotoModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoModal} alt="pošiljka" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12 }} />
        </div>
      )}

      {/* Top nav */}
      <header style={{ background: "#fff", borderBottom: "1.5px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #f97316, #ea580c)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <IcoBox />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>cartly.ba</span>
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>/ dobavljač</span>
          </div>
          {activeTab === "shipments" && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              <IcoPlus /> Nova pošiljka
            </button>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e5e7eb" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 16px", display: "flex", gap: 0 }}>
          {TAB_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "13px 18px", background: "none", border: "none",
                  borderBottom: active ? "2.5px solid #f97316" : "2.5px solid transparent",
                  color: active ? "#f97316" : "#6b7280",
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  cursor: "pointer", marginBottom: -1.5,
                }}
              >
                <Icon /> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* ── SHIPMENTS TAB ──────────────────────────────────────────────────── */}
        {activeTab === "shipments" && (
          <>
            {/* Form modal */}
            {showForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px", overflowY: "auto" }}>
                <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 600, padding: "28px 24px", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>{editingId ? "Uredi pošiljku" : "Nova pošiljka"}</h2>
                    <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: "#f3f4f6", border: "none", width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", color: "#6b7280" }}>✕</button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Datum</label>
                      <input type="date" style={inp} value={formDate} onChange={(e) => setFormDate(e.target.value)}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Status</label>
                      <select style={{ ...inp, appearance: "none" } as React.CSSProperties} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}>
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Items */}
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 10 }}>Proizvodi</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 100px 100px 32px", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, padding: "0 4px" }}>Naziv</span>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textAlign: "center" }}>Kom</span>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textAlign: "right", paddingRight: 4 }}>Cijena/kom</span>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textAlign: "right", paddingRight: 4 }}>Dostava/kom</span>
                      <span />
                    </div>
                    {formItems.map((item, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 60px 100px 100px 32px", gap: 6, alignItems: "center" }}>
                        <select
                          style={{ ...inp, appearance: "none" } as React.CSSProperties}
                          value={item.product_name}
                          onChange={(e) => updateItem(idx, "product_name", e.target.value)}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                        >
                          <option value="">Odaberi...</option>
                          {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input
                          type="number" min={1}
                          style={{ ...inp, textAlign: "center" } as React.CSSProperties}
                          value={item._qtyStr ?? item.quantity}
                          onChange={(e) => updateItem(idx, "_qtyStr", e.target.value)}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.select(); }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                        />
                        <div style={{ position: "relative" }}>
                          <input
                            type="number" min={0} step={0.01}
                            style={{ ...inp, paddingRight: 30 } as React.CSSProperties}
                            value={item._priceStr ?? (item.unit_price || "")}
                            placeholder="0.00"
                            onChange={(e) => updateItem(idx, "_priceStr", e.target.value)}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.select(); }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                          />
                          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9ca3af", fontWeight: 600, pointerEvents: "none" }}>KM</span>
                        </div>
                        <div style={{ position: "relative" }}>
                          <input
                            type="number" min={0} step={0.01}
                            style={{ ...inp, paddingRight: 30 } as React.CSSProperties}
                            value={item._deliveryStr ?? (item.delivery_per_unit || "")}
                            placeholder="10.70"
                            onChange={(e) => updateItem(idx, "_deliveryStr", e.target.value)}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.select(); }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                          />
                          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#9ca3af", fontWeight: 600, pointerEvents: "none" }}>KM</span>
                        </div>
                        <button
                          onClick={() => setFormItems((p) => p.filter((_, i) => i !== idx))}
                          style={{ width: 32, height: 38, background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 8, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <IcoTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setFormItems((p) => [...p, { product_name: "", quantity: 1, unit_price: 0, delivery_per_unit: DEFAULT_DELIVERY, _qtyStr: "1", _priceStr: "", _deliveryStr: String(DEFAULT_DELIVERY) }])}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#f9fafb", border: "1.5px dashed #d1d5db", borderRadius: 8, color: "#6b7280", fontSize: 13, cursor: "pointer", marginBottom: 20 }}
                  >
                    <IcoPlus /> Dodaj stavku
                  </button>

                  {/* Total preview */}
                  <div style={{ background: "#f9fafb", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "14px 18px", marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13, marginBottom: 5 }}>
                      <span>Vrijednost robe</span><span>{formTotal.toFixed(2)} KM</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13, marginBottom: 10, alignItems: "center" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><IcoTruck /> Dostava (Pošta BH)</span>
                      <span>{formDelivery.toFixed(2)} KM</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 17, color: "#f97316", borderTop: "1.5px solid #e5e7eb", paddingTop: 10 }}>
                      <span>Ukupno</span><span>{(formTotal + formDelivery).toFixed(2)} KM</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Napomena</label>
                    <textarea
                      style={{ ...inp, minHeight: 72, resize: "vertical" } as React.CSSProperties}
                      placeholder="Tracking broj, napomena o pakovanju..."
                      value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                    />
                  </div>

                  {/* Photo */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Slika pošiljke</label>
                    {formPhoto ? (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formPhoto} alt="pošiljka" style={{ maxWidth: 260, borderRadius: 10, border: "1.5px solid #e5e7eb" }} />
                        <button onClick={() => setFormPhoto(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>
                          Ukloni
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1.5px dashed #d1d5db", borderRadius: 12, padding: "24px", cursor: "pointer", color: "#9ca3af", fontSize: 13, gap: 8, background: "#f9fafb" }}>
                        <div style={{ color: "#f97316" }}><IcoPhoto /></div>
                        {photoUploading ? "Učitavanje..." : <><span style={{ fontWeight: 600, color: "#374151" }}>Klikni za upload slike</span><span style={{ fontSize: 11 }}>PNG, JPG, WEBP</span></>}
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }} />
                      </label>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, padding: "12px", background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 10, color: "#374151", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
                      Odustani
                    </button>
                    <button onClick={save} disabled={saving} style={{ flex: 2, padding: "12px", background: saving ? "#fdba74" : "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: saving ? "default" : "pointer" }}>
                      {saving ? "Čuvanje..." : editingId ? "Spremi izmjene" : "Dodaj pošiljku"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shipments list */}
            {loadingS ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>Učitavanje...</div>
            ) : shipments.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 64, height: 64, background: "#fff7ed", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#f97316" }}>
                  <IcoBox />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>Nema pošiljki</p>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Dodaj prvu pošiljku klikom na dugme iznad.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {shipments.map((ship) => {
                  const st = statusStyle(ship.status);
                  const isOpen = expandedId === ship.id;
                  const dateStr = new Date(ship.date + "T00:00:00").toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric" });
                  return (
                    <div key={ship.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <button
                        onClick={() => setExpandedId(isOpen ? null : ship.id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", borderBottom: isOpen ? "1.5px solid #f3f4f6" : "none" }}
                      >
                        <span style={{ color: "#9ca3af" }}><IcoChevron open={isOpen} /></span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", minWidth: 90 }}>{dateStr}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, borderRadius: 99, padding: "3px 10px" }}>{st.label}</span>
                        {ship.photo_url && <span style={{ display: "flex", alignItems: "center", color: "#9ca3af" }}><IcoPhoto /></span>}
                        <span style={{ flex: 1 }} />
                        {/* Plaćeno toggle */}
                        <span
                          onClick={async (e) => {
                            e.stopPropagation();
                            await fetch(`/api/supplier/shipments/${ship.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", "x-supplier-password": password },
                              body: JSON.stringify({ placeno: !ship.placeno }),
                            });
                            fetchShipments();
                          }}
                          style={{
                            fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 99, padding: "3px 10px",
                            color: ship.placeno ? "#fff" : "#6b7280",
                            background: ship.placeno ? "#10b981" : "#f3f4f6",
                            border: ship.placeno ? "1.5px solid #10b981" : "1.5px solid #e5e7eb",
                            marginRight: 8, userSelect: "none",
                          }}
                        >
                          {ship.placeno ? "✓ Plaćeno" : "Nije plaćeno"}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#f97316" }}>{(ship.total ?? 0).toFixed(2)} KM</span>
                      </button>

                      {isOpen && (
                        <div style={{ padding: "16px 18px", background: "#fafafa" }}>
                          {ship.supplier_shipment_items.length > 0 && (
                            <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #e5e7eb", overflow: "hidden", marginBottom: 14 }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead style={{ background: "#f9fafb" }}>
                                  <tr>
                                    <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Proizvod</th>
                                    <th style={{ textAlign: "center", padding: "9px 8px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Kom</th>
                                    <th style={{ textAlign: "right", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Cijena</th>
                                    <th style={{ textAlign: "right", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Ukupno</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {ship.supplier_shipment_items.map((it, i) => (
                                    <tr key={i} style={{ borderTop: "1.5px solid #f3f4f6" }}>
                                      <td style={{ padding: "10px 14px", color: "#111827", fontWeight: 500 }}>{it.product_name}</td>
                                      <td style={{ padding: "10px 8px", textAlign: "center", color: "#6b7280" }}>{it.quantity}</td>
                                      <td style={{ padding: "10px 14px", textAlign: "right", color: "#6b7280" }}>{it.unit_price.toFixed(2)} KM</td>
                                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#111827" }}>{(it.quantity * it.unit_price).toFixed(2)} KM</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "12px 16px", marginBottom: 14, fontSize: 13 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 4 }}>
                              <span>Vrijednost robe</span><span>{(ship.total_products ?? 0).toFixed(2)} KM</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", marginBottom: 8, alignItems: "center" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><IcoTruck /> Dostava (Pošta BH)</span>
                              <span>{(ship.delivery_cost ?? DELIVERY_COST).toFixed(2)} KM</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, color: "#f97316", borderTop: "1.5px solid #f3f4f6", paddingTop: 8 }}>
                              <span>Ukupno</span><span>{(ship.total ?? 0).toFixed(2)} KM</span>
                            </div>
                          </div>

                          {ship.notes && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fffbeb", border: "1.5px solid #fef3c7", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#92400e" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                              {ship.notes}
                            </div>
                          )}

                          {ship.photo_url && (
                            <div style={{ marginBottom: 14 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ship.photo_url} alt="pošiljka" onClick={() => setPhotoModal(ship.photo_url)} style={{ maxWidth: 220, borderRadius: 10, border: "1.5px solid #e5e7eb", cursor: "zoom-in" }} />
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => openEdit(ship)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 8, color: "#374151", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                              <IcoEdit /> Uredi
                            </button>
                            <button onClick={() => deleteShipment(ship.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 8, color: "#ef4444", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                              <IcoTrash /> Obriši
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Summary footer */}
                <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 20px", marginTop: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13, marginBottom: 4 }}>
                    <span>Ukupno pošiljki</span><span style={{ fontWeight: 600, color: "#374151" }}>{shipments.length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13, marginBottom: 8 }}>
                    <span>Roba</span><span>{shipments.reduce((s, sh) => s + (sh.total_products ?? 0), 0).toFixed(2)} KM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13, marginBottom: 4 }}>
                    <span>Plaćeno</span>
                    <span style={{ fontWeight: 600, color: "#10b981" }}>
                      {shipments.filter((sh) => sh.placeno).reduce((s, sh) => s + (sh.total ?? 0), 0).toFixed(2)} KM
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 18, color: "#f97316", borderTop: "1.5px solid #f3f4f6", paddingTop: 10 }}>
                    <span>TOTAL</span><span>{shipments.reduce((s, sh) => s + (sh.total ?? 0), 0).toFixed(2)} KM</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CUSTOMERS TAB ──────────────────────────────────────────────────── */}
        {activeTab === "customers" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Datum</label>
                <input type="date" style={inp} value={custDate} onChange={(e) => setCustDate(e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }} />
              </div>
              <button
                onClick={() => fetchOrders(custDate)}
                style={{ padding: "10px 20px", background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}
              >
                Prikaži
              </button>
            </div>

            {loadingO ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>Učitavanje...</div>
            ) : custFetched && orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#9ca3af" }}>
                  <IcoUsers />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>Nema narudžbi za odabrani datum.</p>
              </div>
            ) : orders.length > 0 ? (
              <>
                <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 12 }}>
                  <div style={{ padding: "12px 18px", background: "#f9fafb", borderBottom: "1.5px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                      {new Date(custDate + "T00:00:00").toLocaleDateString("bs-BA", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{orders.length} narudžbi · {orders.reduce((s, o) => s + (o.ukupno ?? 0), 0).toFixed(2)} KM</span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead style={{ background: "#f9fafb" }}>
                      <tr>
                        <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>#</th>
                        <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Kupac</th>
                        <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Adresa / Grad</th>
                        <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Proizvod</th>
                        <th style={{ textAlign: "left", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Telefon</th>
                        <th style={{ textAlign: "right", padding: "9px 14px", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Iznos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={i} style={{ borderTop: "1.5px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 14px", color: "#9ca3af" }}>{i + 1}</td>
                          <td style={{ padding: "10px 14px", color: "#111827", fontWeight: 600 }}>{o.ime}</td>
                          <td style={{ padding: "10px 14px", color: "#6b7280" }}>
                            <div style={{ fontWeight: 500, color: "#374151" }}>{o.adresa}</div>
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>{o.grad}</div>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#f97316", background: "#fff7ed", borderRadius: 6, padding: "3px 8px" }}>{o.proizvod}</span>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#6b7280", fontFamily: "monospace", fontSize: 12 }}>{o.telefon}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#111827" }}>{(o.ukupno ?? 0).toFixed(2)} KM</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>
                Odaberi datum i klikni &ldquo;Prikaži&rdquo;.
              </div>
            )}
          </div>
        )}

        {/* ── EXPORT TAB ─────────────────────────────────────────────────────── */}
        {activeTab === "export" && (
          <div style={{ maxWidth: 440 }}>
            <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", padding: "28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, background: "#fff7ed", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316" }}>
                  <IcoDownload />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Export za Poštu BH</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Preuzmi Excel fajl za unos u sistem</p>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase" as const, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Datum pošiljki</label>
                <input type="date" style={inp} value={expDate} onChange={(e) => setExpDate(e.target.value)}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#f97316"; }} onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }} />
              </div>
              <button
                onClick={exportPosta}
                disabled={expLoading}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", background: expLoading ? "#fdba74" : "linear-gradient(135deg, #f97316, #ea580c)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: expLoading ? "default" : "pointer" }}
              >
                <IcoDownload /> {expLoading ? "Generisanje..." : "Preuzmi Excel"}
              </button>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 14, textAlign: "center" }}>
                Fajl sadrži sve narudžbe za odabrani dan u formatu za Poštu BH.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
