"use client";

const ACCENT = "#B33000";

const reviews = [
  {
    name: "Amir H.",
    city: "Sarajevo",
    rating: 5,
    text: "Nosim ih svaki dan na gradilištu, super udobne i BOA sistem je genijalan. Ne bih ih zamijenio ni za šta.",
    role: "Građevinski radnik",
    ago: "Prije 2 dana",
  },
  {
    name: "Nedim K.",
    city: "Mostar",
    rating: 5,
    text: "Naručio sam u ponedjeljak, stigle u srijedu. Kvalitet odličan za ovu cijenu. Preporučujem svima!",
    role: "Elektro tehničar",
    ago: "Prije 5 dana",
  },
  {
    name: "Mirza T.",
    city: "Zenica",
    rating: 4,
    text: "Odlične za rad u fabrici. Čelična kapica drži kako treba, noge mi nisu pucale ni nakon 10-satne smjene.",
    role: "Fabrika metalnih dijelova",
    ago: "Prije tjedan dana",
  },
  {
    name: "Damir S.",
    city: "Banja Luka",
    rating: 5,
    text: "Već treći par od ovog brenda. Nikad nisam bio razočaran, uvijek iste kvalitete. Sad ih kupuje i kolega.",
    role: "Vozač viljuškara",
    ago: "Prije 9 dana",
  },
  {
    name: "Kenan B.",
    city: "Tuzla",
    rating: 5,
    text: "Dostava brza, patike tačno kao na slici. Savršeno pristaju na nogu, BOA sistem je best.",
    role: "Serviser",
    ago: "Prije 11 dana",
  },
  {
    name: "Alen F.",
    city: "Bihać",
    rating: 5,
    text: "Nosio sam ih cijelu smjenu od 10 sati, noge su mi bile kao da hodam u patikama. Nikad više klasične zaštitne cipele.",
    role: "Lučki radnik",
    ago: "Prije 2 tjedna",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i < rating ? ACCENT : "none"} stroke={ACCENT} strokeWidth="1.75"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const colors = [
    ["#B33000", "#B33000"],
    ["#7C3AED", "#6D28D9"],
    ["#0891B2", "#0E7490"],
    ["#16A34A", "#15803D"],
    ["#DC2626", "#B91C1C"],
    ["#D97706", "#B45309"],
  ];
  const idx   = name.charCodeAt(0) % colors.length;
  const [a, b] = colors[idx];
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${a}, ${b})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 800, color: "#fff",
      fontFamily: "var(--font-manrope), sans-serif",
      letterSpacing: "-0.02em",
    }}>
      {name[0]}
    </div>
  );
}

export default function Reviews() {
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const fiveStars = reviews.filter(r => r.rating === 5).length;

  return (
    <section style={{ background: "#F9F9F9", borderTop: "1px solid #EEEEEE" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 72px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 24 }}>
          <div>
            <span style={{
              display: "inline-block",
              background: "rgba(255,107,0,0.1)", color: ACCENT,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", padding: "5px 14px", borderRadius: 4,
              fontFamily: "var(--font-manrope), sans-serif", marginBottom: 14,
            }}>
              Recenzije kupaca
            </span>
            <h2 style={{
              fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 900,
              letterSpacing: "-0.03em", color: "#0A0A0A", margin: 0,
              fontFamily: "var(--font-manrope), sans-serif",
            }}>
              Šta naši kupci <span style={{ color: ACCENT }}>kažu?</span>
            </h2>
          </div>

          {/* Rating summary card */}
          <div style={{
            background: "#fff", border: "1px solid #EEEEEE", borderRadius: 16,
            padding: "20px 28px", display: "flex", alignItems: "center", gap: 24,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: 44, fontWeight: 900, color: "#0A0A0A", margin: 0, lineHeight: 1,
                fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.04em",
              }}>
                {avgRating}
              </p>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 6, gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                    fill={ACCENT} stroke={ACCENT} strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p style={{
                fontSize: 11, color: "#999", margin: "6px 0 0",
                fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500,
              }}>
                1.200+ recenzija
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 120 }}>
              {[5, 4, 3].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct   = Math.round((count / reviews.length) * 100);
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#999", width: 10, textAlign: "right",
                      fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600 }}>{star}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={ACCENT} stroke={ACCENT} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div style={{ flex: 1, height: 6, background: "#F0F0F0", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#999", width: 28,
                      fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
          {[
            { val: "1.200+", label: "Zadovoljnih kupaca" },
            { val: `${fiveStars}/${reviews.length}`, label: "Recenzija 5 zvjezdica" },
            { val: "98%", label: "Preporučuje prijatelju" },
          ].map(({ val, label }) => (
            <div key={label} style={{
              background: "#fff", border: "1px solid #EEEEEE", borderRadius: 12,
              padding: "12px 20px", flex: "1 1 160px",
            }}>
              <p style={{
                fontSize: 22, fontWeight: 900, color: "#0A0A0A", margin: "0 0 2px",
                fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "-0.03em",
              }}>
                {val}
              </p>
              <p style={{
                fontSize: 12, color: "#888", margin: 0,
                fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500,
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Review cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {reviews.map((r) => (
            <div
              key={r.name + r.city}
              style={{
                background: "#fff",
                border: "1px solid #EEEEEE",
                borderRadius: 18,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                transition: "box-shadow 200ms, border-color 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow    = "0 6px 24px rgba(0,0,0,0.07)";
                e.currentTarget.style.borderColor  = "rgba(255,107,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow    = "none";
                e.currentTarget.style.borderColor  = "#EEEEEE";
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={r.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 14, fontWeight: 800, color: "#0A0A0A",
                      fontFamily: "var(--font-manrope), sans-serif",
                    }}>
                      {r.name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#16A34A",
                      background: "rgba(22,163,74,0.1)", padding: "2px 7px", borderRadius: 4,
                      fontFamily: "var(--font-manrope), sans-serif", letterSpacing: "0.05em",
                    }}>
                      ✓ VERIFIKOVANO
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12, color: "#999", margin: "2px 0 0",
                    fontFamily: "var(--font-manrope), sans-serif",
                  }}>
                    {r.role} · {r.city}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: "#ccc", flexShrink: 0,
                  fontFamily: "var(--font-manrope), sans-serif" }}>
                  {r.ago}
                </span>
              </div>

              <Stars rating={r.rating} />

              <p style={{
                fontSize: 14, color: "rgba(10,10,10,0.7)", lineHeight: 1.65,
                margin: 0, fontFamily: "var(--font-manrope), sans-serif",
                fontStyle: "italic",
              }}>
                &ldquo;{r.text}&rdquo;
              </p>

              {/* Bought label */}
              <div style={{
                borderTop: "1px solid #F5F5F5", paddingTop: 12,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span style={{
                  fontSize: 11, color: "#888",
                  fontFamily: "var(--font-manrope), sans-serif", fontWeight: 500,
                }}>
                  Kupovina potvrđena
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
