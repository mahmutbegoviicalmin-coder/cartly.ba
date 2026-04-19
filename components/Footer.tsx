"use client";

import { useState } from "react";

function FacebookIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FooterSocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: hovered ? "#FF6B00" : "#ffffff",
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

export default function Footer() {
  return (
    <footer style={{ background: "#0A0A0A", fontFamily: "var(--font-inter), sans-serif" }}>
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "40px 80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}
        className="footer-inner"
      >

        {/* Left: Logo + copyright */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }} className="footer-left">
          <span style={{ fontWeight: 800, fontSize: 20, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Cartly
          </span>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            &copy; 2026 Cartly.ba. Sva prava zadržana.
          </p>
        </div>

        {/* Center: Social icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }} className="footer-center">
          <FooterSocialIcon href="https://www.facebook.com/profile.php?id=61560527743426">
            <FacebookIcon size={24} />
          </FooterSocialIcon>
          <FooterSocialIcon href="https://www.instagram.com/cartly.ba">
            <InstagramIcon size={24} />
          </FooterSocialIcon>
        </div>

        {/* Right: Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }} className="footer-right">
          <a
            href="#"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FF6B00"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            Radne Patike S3
          </a>
          <a
            href="mailto:taysibog@gmail.com"
            style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FF6B00"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            Kontakt
          </a>
        </div>
      </div>

    </footer>
  );
}
