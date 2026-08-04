"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: hovered ? "#B33000" : "#0A0A0A", transition: "color 0.15s", display: "flex", alignItems: "center" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

const NAV_LINKS = [
  { label: "Radne patike", href: "/radne-patike" },
  { label: "Ležaljke", href: "/lezaljke" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isLezaljke = pathname === "/lezaljke";
  const ctaHref = isLezaljke ? "#naruci" : "#order";
  const ctaLabel = isLezaljke ? "Naruči ležaljku" : "Naruči odmah";

  return (
    <>
      <style>{`
        .nav-link {
          font-family: var(--font-manrope), sans-serif;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          padding: 6px 2px;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
        }
        .nav-link:hover { color: #B33000 !important; border-color: #B33000; }
        .nav-link.active { border-color: #0A0A0A; }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-divider { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
        }
        @media (max-width: 900px) {
          .nav-inner { padding: 0 24px !important; }
        }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "#fff",
        borderBottom: "1px solid #F0F0F0",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        transition: "box-shadow 0.2s",
      }}>
        <div className="nav-inner" style={{
          maxWidth: 1152, margin: "0 auto", padding: "0 80px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-manrope), sans-serif", fontWeight: 800, fontSize: 22, color: "#0A0A0A", letterSpacing: "-0.03em" }}>
              cartly<span style={{ color: "#B33000" }}>.</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}
                className={`nav-link${pathname === l.href ? " active" : ""}`}
                style={{ color: pathname === l.href ? "#0A0A0A" : "#555" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Social icons – desktop only */}
            <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SocialIcon href="https://www.facebook.com/profile.php?id=61560527743426"><FacebookIcon /></SocialIcon>
              <SocialIcon href="https://www.instagram.com/cartly.ba"><InstagramIcon /></SocialIcon>
            </div>

            <div className="nav-divider" style={{ width: 1, height: 20, background: "#E5E5E5" }} />

            {/* CTA – desktop */}
            <a href={ctaHref} className="nav-cta" style={{
              fontFamily: "var(--font-manrope), sans-serif", fontWeight: 600, fontSize: 14,
              color: "#fff", background: "#B33000", borderRadius: 8,
              padding: "10px 20px", textDecoration: "none", transition: "background 0.15s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#E85E00"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#B33000"; }}
            >
              {ctaLabel}
            </a>

            {/* Hamburger – mobile */}
            <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} style={{
              display: "none", flexDirection: "column", gap: 5, background: "none",
              border: "none", cursor: "pointer", padding: 4,
            }} aria-label="Meni">
              <span style={{ display: "block", width: 22, height: 2, background: "#0A0A0A", borderRadius: 2, transition: "transform 0.25s, opacity 0.25s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#0A0A0A", borderRadius: 2, transition: "opacity 0.2s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#0A0A0A", borderRadius: 2, transition: "transform 0.25s, opacity 0.25s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 999,
        pointerEvents: menuOpen ? "auto" : "none",
      }}>
        {/* Backdrop */}
        <div onClick={() => setMenuOpen(false)} style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
          opacity: menuOpen ? 1 : 0, transition: "opacity 0.25s",
        }} />

        {/* Drawer panel */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 280,
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
          display: "flex", flexDirection: "column",
          paddingTop: 80,
        }}>
          {/* Nav links */}
          <div style={{ flex: 1, padding: "8px 0" }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 28px",
                fontFamily: "var(--font-manrope), sans-serif",
                fontWeight: pathname === l.href ? 800 : 600,
                fontSize: 16,
                color: pathname === l.href ? "#0A0A0A" : "#444",
                textDecoration: "none",
                borderLeft: pathname === l.href ? "3px solid #B33000" : "3px solid transparent",
                transition: "all 0.15s",
              }}>
                {l.label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ))}
          </div>

          {/* Social + CTA at bottom */}
          <div style={{ padding: "24px 28px", borderTop: "1px solid #F0F0F0" }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <SocialIcon href="https://www.facebook.com/profile.php?id=61560527743426"><FacebookIcon /></SocialIcon>
              <SocialIcon href="https://www.instagram.com/cartly.ba"><InstagramIcon /></SocialIcon>
            </div>
            <a href={ctaHref} onClick={() => setMenuOpen(false)} style={{
              display: "block", textAlign: "center",
              fontFamily: "var(--font-manrope), sans-serif", fontWeight: 700, fontSize: 15,
              color: "#fff", background: "#B33000", borderRadius: 10,
              padding: "14px", textDecoration: "none",
            }}>
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
