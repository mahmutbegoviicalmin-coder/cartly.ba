"use client";

const cards = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Čelična kapica",
    desc: "Zaštita do 200 J po EN ISO 20345 S3 standardu",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    title: "Anti-klizajući đon",
    desc: "SRC sertifikovani grip — siguran na svakoj podlozi",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "S3 Certifikat",
    desc: "EN ISO 20345 — međunarodni standard za radnu obuću",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: "BOA® Fit System",
    desc: "Precizno podešavanje u sekundi — bez vezivanja",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: "Lagane i udobne",
    desc: "Svega 650g — kao da nosiš tenisice, ne zaštitne cipele",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
        <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
      </svg>
    ),
    title: "Vodootpornost",
    desc: "Membrana sprječava prodor vlage u svakom vremenskim uvjetima",
  },
];

export default function BenefitsV2() {
  return (
    <section style={{ background: "#F5F5F5", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Heading */}
        <div style={{ marginBottom: 48, maxWidth: 560 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#F97316",
            fontFamily: "var(--font-manrope), sans-serif", marginBottom: 12,
          }}>
            Karakteristike
          </p>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#111",
            fontFamily: "var(--font-manrope), sans-serif", lineHeight: 1.15,
          }}>
            Zašto radnici biraju<br />Tactical S3
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {cards.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "#fff",
              borderRadius: 14,
              padding: "28px 24px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}>
              <div style={{ color: "#F97316", marginBottom: 16 }}>{icon}</div>
              <h3 style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 16, fontWeight: 700, color: "#111",
                marginBottom: 6,
              }}>
                {title}
              </h3>
              <p style={{
                fontFamily: "var(--font-manrope), sans-serif",
                fontSize: 13, color: "#666", lineHeight: 1.6, margin: 0,
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
