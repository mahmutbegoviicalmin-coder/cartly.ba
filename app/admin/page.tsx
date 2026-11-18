"use client";

import { useState, FormEvent } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      window.location.assign("/admin/dashboard");
    } else {
      setError(data.error ?? "Greška pri prijavi.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "radial-gradient(900px 500px at 50% -10%, #FDEDE7 0%, #F5F5F7 60%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        color: "#1D1D1F",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 26,
          padding: "30px 28px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 30px 60px -30px rgba(110,45,25,0.35), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lisko/lisko-320.webp" alt="Lisko" width={96} height={104} style={{ display: "block", margin: "0 auto 12px", filter: "drop-shadow(0 12px 16px rgba(110,45,25,0.2))" }} />
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1 }}>
            cartly<span style={{ color: "#F45B39" }}>.</span>ba
          </div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500, color: "#86868B" }}>Admin panel</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6E6E73", marginBottom: 8 }}>
            Lozinka
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Unesite lozinku"
            autoFocus
            required
            style={{
              width: "100%",
              height: 48,
              padding: "0 16px",
              fontSize: 16,
              border: "none",
              borderRadius: 14,
              background: "#F2F2F4",
              color: "#1D1D1F",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {error && <p style={{ fontSize: 13, color: "#E0262D", margin: "8px 0 0" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 16,
              height: 48,
              background: loading ? "#F9B5A5" : "#F45B39",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 650,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Prijava..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
}
