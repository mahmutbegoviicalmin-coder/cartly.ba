"use client";

const workers = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2"/>
        <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="11" x2="12" y2="16"/>
        <line x1="9.5" y1="13.5" x2="14.5" y2="13.5"/>
      </svg>
    ),
    title: "Građevina",
    desc: "Zaštita od pada predmeta i proboja na gradilištu",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    title: "Skladišta",
    desc: "Grip i zaštita za rad s viličarima i teškim teretom",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93L17.66 6.34M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34 4.93 4.93"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      </svg>
    ),
    title: "Industrija",
    desc: "Antistatička zaštita i otpornost na kemikalije",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Elektrotehnika",
    desc: "Antistatička obuća sigurna za rad s elektroinstalacijama",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "Tehničari",
    desc: "Udobnost za dugačke smjene i servisni rad",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: "Logistika",
    desc: "Lagane i čvrste za cijeli dan kretanja i utovara",
  },
];

export default function WhoForV2() {
  return (
    <section style={{ background: "#fff", padding: "80px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        <div style={{ marginBottom: 48, maxWidth: 560 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#F97316",
            fontFamily: "var(--font-manrope), sans-serif", marginBottom: 12,
          }}>
            Namijenjene za
          </p>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "#111",
            fontFamily: "var(--font-manrope), sans-serif", lineHeight: 1.15,
          }}>
            Za svako radno mjesto
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {workers.map(({ icon, title, desc }) => (
            <div key={title} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: "22px 20px",
              borderRadius: 12,
              border: "1px solid #EBEBEB",
              transition: "border-color 200ms, box-shadow 200ms",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(249,115,22,0.3)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(249,115,22,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#EBEBEB";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 52, height: 52,
                borderRadius: 12,
                background: "#FFF4EE",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                color: "#F97316",
              }}>
                {icon}
              </div>
              <div>
                <h3 style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4,
                }}>
                  {title}
                </h3>
                <p style={{
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontSize: 13, color: "#777", lineHeight: 1.55, margin: 0,
                }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
