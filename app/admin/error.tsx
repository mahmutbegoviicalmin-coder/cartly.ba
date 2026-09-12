"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#070708",
        color: "#f5f5f7",
        padding: 32,
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>Admin se srušio</h1>
      <p style={{ color: "#a1a1a6", margin: "0 0 16px" }}>{error.message}</p>
      <button
        type="button"
        onClick={reset}
        style={{
          height: 44,
          padding: "0 18px",
          border: "none",
          borderRadius: 12,
          background: "#0a84ff",
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
