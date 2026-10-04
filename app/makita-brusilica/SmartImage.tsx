"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import { MUTED, SOFT, F } from "./theme";

interface Props {
  src: string;
  alt: string;
  /** Short hint shown on the placeholder, e.g. "Hero 1:1". */
  label: string;
  ratio?: string;
  radius?: number;
  fit?: "cover" | "contain";
  eager?: boolean;
  /** Icon-only placeholder for small thumbnails. */
  minimal?: boolean;
  /** Background behind a contained photo (match the photo's own backdrop). */
  bg?: string;
}

/** Renders the photo when it exists, otherwise a clean labelled placeholder. */
export default function SmartImage({ src, alt, label, ratio = "1 / 1", radius = 24, fit = "cover", eager, minimal, bg }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // onError can fire before hydration; catch images that already failed.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  return (
    <div
      style={{
        position: "relative", width: "100%", aspectRatio: ratio, borderRadius: radius,
        overflow: "hidden",
        background: bg && !failed ? bg : "linear-gradient(145deg, #F5F5F7 0%, #ECECEF 55%, #E4E6EA 100%)",
      }}
    >
      {failed && minimal ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImageIcon size={18} color={SOFT} strokeWidth={1.6} />
        </div>
      ) : failed ? (
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10, padding: 16, textAlign: "center",
            fontFamily: F,
          }}
        >
          <div
            style={{
              width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <ImageIcon size={22} color={SOFT} strokeWidth={1.6} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: "-0.01em" }}>{label}</div>
          <div style={{ fontSize: 11, color: SOFT, wordBreak: "break-all" }}>public{src}</div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }}
        />
      )}
    </div>
  );
}
