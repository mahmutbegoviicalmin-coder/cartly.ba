"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

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
        minHeight: "100dvh",
        background: "#070708",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
        color: "#f5f5f7",
      }}
    >
      <div
        style={{
          background: "#141416",
          borderRadius: 22,
          padding: "36px 28px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(10,132,255,0.16)",
              color: "#64d2ff",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 14px",
            }}
          >
            <Lock size={22} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1 }}>
            cartly<span style={{ color: "#0a84ff" }}>.</span>ba
          </div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500, color: "#6e6e73" }}>Admin</div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#a1a1a6", marginBottom: 8 }}>
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
              background: "#2c2c2e",
              color: "#f5f5f7",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {error && <p style={{ fontSize: 13, color: "#ff453a", margin: "8px 0 0" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 16,
              height: 48,
              background: loading ? "#3a3a3c" : "#0a84ff",
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
