"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F5F5F7",
        color: "#1D1D1F",
        padding: 32,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>Admin se srušio</h1>
      <p style={{ color: "#6E6E73", margin: "0 0 16px" }}>{error.message}</p>
      <button
        type="button"
        onClick={reset}
        style={{
          height: 44,
          padding: "0 18px",
          border: "none",
          borderRadius: 12,
          background: "#F45B39",
          color: "#fff",
          fontWeight: 650,
          cursor: "pointer",
        }}
      >
        Pokušaj ponovo
      </button>
    </div>
  );
}
