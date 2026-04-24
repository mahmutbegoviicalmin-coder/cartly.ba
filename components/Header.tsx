"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Manrope } from "next/font/google";
import { ArrowRight, ChevronDown } from "lucide-react";
import { RiInstagramLine, RiFacebookCircleLine } from "react-icons/ri";

const manrope = Manrope({
  subsets: ["latin"],
  weight:  ["400", "500", "600", "700", "800"],
  display: "swap",
});

const ACCENT = "#FF6B00";

interface NavLink {
  label: string;
  href:  string;
  sub?:  { label: string; href: string }[];
}

const NAV_LINKS: NavLink[] = [
  {
    label: "ALATI",
    href:  "/milwaukee-busilica",
    sub: [
      { label: "Milwaukee M18 Bušilica",  href: "/milwaukee-busilica" },
      { label: "Akumulatorska Brusilica", href: "/brusilica"          },
    ],
  },
  { label: "VIDEO NADZOR", href: "/kamera"  },
  { label: "RADNA OBUĆA",  href: "/"        },
  { label: "DOM",          href: "/zvucnik" },
];

export default function Header() {
  const pathname  = usePathname();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function isActive(href: string) {
    return pathname === href;
  }

  function isCategoryActive(link: NavLink) {
    if (link.sub) return link.sub.some(s => pathname === s.href);
    return pathname === link.href;
  }

  return (
    <>
      <style>{`
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: ${ACCENT};
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 250ms ease;
          border-radius: 2px;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
        }
        .nav-link.active {
          color: #1a1a1a;
          font-weight: 700;
        }
        .cta-btn:hover {
          transform: scale(1.035);
          box-shadow: 0 4px 24px rgba(255,107,0,0.38);
        }
        .mobile-link {
          position: relative;
          display: block;
        }
        .mobile-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #F0EBE3;
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .menu-open { animation: menuSlide 280ms ease-out both; }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) translateX(-50%); }
          to   { opacity: 1; transform: translateY(0)    translateX(-50%); }
        }
        .drop-in { animation: dropIn 180ms ease-out both; }
      `}</style>

      <header
        className={`${manrope.className} sticky top-0 z-50 w-full transition-all duration-300`}
        style={{
          background:           scrolled ? "rgba(255,255,255,0.97)" : "#FFFFFF",
          borderBottom:         scrolled ? "1px solid transparent" : "1px solid #F0EBE3",
          boxShadow:            scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none",
          backdropFilter:       scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        {/* ── Main bar ───────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px", height: 72 }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }} className="flex-shrink-0">
            <span style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.02em", lineHeight: 1 }}>
              cartly<span style={{ color: ACCENT }}>.</span>
            </span>
          </Link>

          {/* ── Desktop nav ─────────────────────────────────────── */}
          <nav className="hidden lg:flex items-center" style={{ gap: 36 }}>
            {NAV_LINKS.map((link) =>
              link.sub ? (
                <DropdownNav
                  key={link.label}
                  link={link}
                  active={isCategoryActive(link)}
                  currentPath={pathname}
                />
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link relative ${isActive(link.href) ? "active" : ""}`}
                  style={{
                    fontSize:       11,
                    fontWeight:     isActive(link.href) ? 700 : 600,
                    letterSpacing:  "0.1em",
                    textTransform:  "uppercase",
                    color:          isActive(link.href) ? "#1a1a1a" : "#888888",
                    textDecoration: "none",
                    transition:     "color 200ms ease",
                    paddingBottom:  2,
                  }}
                  onMouseEnter={e => {
                    if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
                  }}
                  onMouseLeave={e => {
                    if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = "#888888";
                  }}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* ── Right side ──────────────────────────────────────── */}
          <div className="hidden lg:flex items-center" style={{ gap: 20 }}>
            <Link
              href="/proizvodi"
              className="cta-btn"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            8,
                background:     ACCENT,
                color:          "white",
                fontWeight:     700,
                fontSize:       13,
                letterSpacing:  "0.06em",
                textTransform:  "uppercase",
                borderRadius:   12,
                padding:        "11px 22px",
                textDecoration: "none",
                transition:     "all 200ms ease",
                whiteSpace:     "nowrap",
              }}
            >
              Pogledaj ponudu
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SocialLink href="https://instagram.com/cartly.ba" label="Instagram">
                <RiInstagramLine size={19} />
              </SocialLink>
              <SocialLink href="https://facebook.com/cartly.ba" label="Facebook">
                <RiFacebookCircleLine size={19} />
              </SocialLink>
            </div>
          </div>

          {/* ── Hamburger ───────────────────────────────────────── */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
            style={{ background: menuOpen ? "#F5F0E8" : "transparent", border: "none", cursor: "pointer" }}
          >
            <span style={{ display: "block", position: "relative", width: 20, height: 14 }}>
              <span style={{ position: "absolute", left: 0, width: "100%", height: 2, background: "#1a1a1a", borderRadius: 2, top: menuOpen ? "50%" : 0, transform: menuOpen ? "translateY(-50%) rotate(45deg)" : "none", transition: "all 260ms ease" }} />
              <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "100%", height: 2, background: "#1a1a1a", borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "opacity 200ms ease" }} />
              <span style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 2, background: "#1a1a1a", borderRadius: 2, top: menuOpen ? "50%" : "auto", transform: menuOpen ? "translateY(-50%) rotate(-45deg)" : "none", transition: "all 260ms ease" }} />
            </span>
          </button>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────── */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="lg:hidden menu-open"
            style={{ background: "#FFFFFF", borderTop: "1px solid #F0EBE3", paddingBottom: 24 }}
          >
            <nav style={{ padding: "8px 24px 0" }}>
              {NAV_LINKS.map((link, i) =>
                link.sub ? (
                  <div key={link.label}>
                    {/* ALATI accordion toggle */}
                    <button
                      onClick={() => setMobileExpanded(v => v === link.label ? null : link.label)}
                      className="mobile-link w-full text-left"
                      style={{
                        padding:        "16px 0",
                        fontSize:       14,
                        fontWeight:     isCategoryActive(link) ? 700 : 600,
                        letterSpacing:  "0.08em",
                        textTransform:  "uppercase",
                        color:          isCategoryActive(link) ? ACCENT : "#555555",
                        background:     "none",
                        border:         "none",
                        cursor:         "pointer",
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "space-between",
                        animationDelay: `${i * 40}ms`,
                        animation:      `menuSlide 280ms ease-out ${i * 40}ms both`,
                      }}
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        style={{
                          color:      ACCENT,
                          transition: "transform 200ms ease",
                          transform:  mobileExpanded === link.label ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>

                    {/* Sub-items */}
                    {mobileExpanded === link.label && (
                      <div style={{ paddingLeft: 16, paddingBottom: 8 }}>
                        {link.sub.map(({ label: subLabel, href: subHref }) => (
                          <Link
                            key={subHref}
                            href={subHref}
                            onClick={() => setMenuOpen(false)}
                            style={{
                              display:        "flex",
                              alignItems:     "center",
                              padding:        "10px 0",
                              textDecoration: "none",
                              fontSize:       13,
                              fontWeight:     pathname === subHref ? 700 : 500,
                              color:          pathname === subHref ? ACCENT : "#777777",
                              gap:            8,
                            }}
                          >
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: pathname === subHref ? ACCENT : "#ccc", flexShrink: 0 }} />
                            {subLabel}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="mobile-link"
                    style={{
                      padding:        "16px 0",
                      textDecoration: "none",
                      fontSize:       14,
                      fontWeight:     isActive(link.href) ? 700 : 600,
                      letterSpacing:  "0.08em",
                      textTransform:  "uppercase",
                      color:          isActive(link.href) ? ACCENT : "#555555",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      animationDelay: `${i * 40}ms`,
                      animation:      `menuSlide 280ms ease-out ${i * 40}ms both`,
                    }}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                    )}
                  </Link>
                )
              )}
            </nav>

            {/* Mobile CTA */}
            <div style={{ padding: "20px 24px 0", animation: "menuSlide 280ms ease-out 160ms both" }}>
              <Link
                href="/proizvodi"
                onClick={() => setMenuOpen(false)}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            8,
                  background:     ACCENT,
                  color:          "white",
                  fontWeight:     700,
                  fontSize:       13,
                  letterSpacing:  "0.06em",
                  textTransform:  "uppercase",
                  borderRadius:   12,
                  padding:        "14px 24px",
                  textDecoration: "none",
                }}
              >
                Pogledaj ponudu
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Mobile socials */}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "20px 24px 0", animation: "menuSlide 280ms ease-out 200ms both" }}>
              <SocialLink href="https://instagram.com/cartly.ba" label="Instagram">
                <RiInstagramLine size={22} />
              </SocialLink>
              <SocialLink href="https://facebook.com/cartly.ba" label="Facebook">
                <RiFacebookCircleLine size={22} />
              </SocialLink>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

// ── Dropdown nav item ─────────────────────────────────────────────────────────
function DropdownNav({
  link,
  active,
  currentPath,
}: {
  link:        NavLink;
  active:      boolean;
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        className={`nav-link relative ${active ? "active" : ""}`}
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            5,
          fontSize:       11,
          fontWeight:     active ? 700 : 600,
          letterSpacing:  "0.1em",
          textTransform:  "uppercase",
          color:          active ? "#1a1a1a" : "#888888",
          background:     "none",
          border:         "none",
          cursor:         "pointer",
          padding:        0,
          paddingBottom:  2,
          transition:     "color 200ms ease",
        }}
        onMouseEnter={e => {
          if (!active) (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
        }}
        onMouseLeave={e => {
          if (!active) (e.currentTarget as HTMLElement).style.color = "#888888";
        }}
      >
        {link.label}
        <ChevronDown
          size={10}
          strokeWidth={2.5}
          style={{
            transition: "transform 200ms ease",
            transform:  open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="drop-in"
          style={{
            position:     "absolute",
            top:          "calc(100% + 12px)",
            left:         "50%",
            transform:    "translateX(-50%)",
            background:   "#FFFFFF",
            border:       "1px solid #F0EBE3",
            borderRadius: 14,
            boxShadow:    "0 8px 28px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)",
            minWidth:     220,
            padding:      "6px",
            zIndex:       200,
          }}
        >
          {link.sub!.map(({ label: subLabel, href: subHref }) => {
            const subActive = currentPath === subHref;
            return (
              <Link
                key={subHref}
                href={subHref}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            10,
                  padding:        "10px 14px",
                  borderRadius:   10,
                  textDecoration: "none",
                  fontSize:       13,
                  fontWeight:     subActive ? 700 : 500,
                  color:          subActive ? ACCENT : "#333333",
                  background:     subActive ? "rgba(255,107,0,0.06)" : "transparent",
                  transition:     "background 150ms ease, color 150ms ease",
                }}
                onMouseEnter={e => {
                  if (!subActive) {
                    (e.currentTarget as HTMLElement).style.background = "#F8F5F1";
                    (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
                  }
                }}
                onMouseLeave={e => {
                  if (!subActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#333333";
                  }
                }}
              >
                <span
                  style={{
                    width:        6,
                    height:       6,
                    borderRadius: "50%",
                    background:   subActive ? ACCENT : "#DDD",
                    flexShrink:   0,
                    transition:   "background 150ms ease",
                  }}
                />
                {subLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Social icon ───────────────────────────────────────────────────────────────
function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          color:      hovered ? "#1a1a1a" : "#BBBBBB",
          display:    "flex",
          transition: "color 150ms ease, transform 150ms ease",
          transform:  hovered ? "scale(1.15)" : "scale(1)",
        }}
      >
        {children}
      </a>
      {hovered && (
        <span style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "white", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none" }}>
          {label}
        </span>
      )}
    </div>
  );
}
