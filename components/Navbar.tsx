"use client";

import { useState, useEffect } from "react";

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: hovered ? "#FF6B00" : "#0A0A0A",
        transition: "color 0.15s",
        display: "flex",
        alignItems: "center",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #F0F0F0",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 80px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="nav-inner"
      >
        <span
          style={{
            fontFamily: "var(--font-manrope), sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#0A0A0A",
            letterSpacing: "-0.03em",
          }}
        >
          Cartly
        </span>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Social icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SocialIcon href="https://www.facebook.com/profile.php?id=61560527743426">
              <FacebookIcon />
            </SocialIcon>
            <SocialIcon href="https://www.instagram.com/cartly.ba">
              <InstagramIcon />
            </SocialIcon>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "#E5E5E5" }} className="nav-divider" />

          {/* CTA */}
          <a
            href="#order"
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#fff",
              background: "#FF6B00",
              borderRadius: 8,
              padding: "12px 24px",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#E85E00"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FF6B00"; }}
            className="nav-cta"
          >
            Naruči odmah
          </a>
        </div>
      </div>

    </nav>
  );
}
