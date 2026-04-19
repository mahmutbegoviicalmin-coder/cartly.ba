"use client";

export default function CTABanner() {
  return (
    <div className="bg-white border-t border-black/10 py-8 flex justify-center px-4">
      <a
        href="#order"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF6B00",
          color: "#fff",
          fontFamily: "var(--font-inter), sans-serif",
          fontWeight: 600,
          fontSize: 16,
          borderRadius: 8,
          padding: "16px 40px",
          minWidth: 280,
          width: "100%",
          maxWidth: 400,
          textDecoration: "none",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#e05e00"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#FF6B00"; }}
      >
        Naruči odmah
      </a>
    </div>
  );
}
