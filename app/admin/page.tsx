"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      router.push("/admin/dashboard");
    } else {
      setError(data.error ?? "Greška pri prijavi.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-inter), sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
            Cartly
          </span>
          <span
            style={{
              display: "block",
              fontSize: 13,
              color: "#999",
              fontWeight: 400,
              marginTop: 4,
            }}
          >
            Admin panel
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0A0A0A", marginBottom: 8 }}
            >
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
                padding: "13px 16px",
                fontSize: 15,
                border: `1px solid ${error ? "#ef4444" : "#E5E5E5"}`,
                borderRadius: 8,
                background: "#F9F9F9",
                fontFamily: "var(--font-inter), sans-serif",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B00"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#ef4444" : "#E5E5E5"; }}
            />
            {error && (
              <p style={{ fontSize: 12, color: "#ef4444", margin: "6px 0 0" }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#ccc" : "#FF6B00",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-inter), sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#E85E00"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#FF6B00"; }}
          >
            {loading ? "Prijava..." : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
}
