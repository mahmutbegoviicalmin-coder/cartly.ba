"use client";

import { useEffect, useState } from "react";
import Mascot from "./Mascot";

interface Props {
  size: number;
  /** What Lisko says. Tapping him cycles through these. */
  messages?: string[];
  /** Where the speech bubble sits relative to Lisko. */
  bubble?: "left" | "right" | "top" | "top-end";
  /** Rotate messages on their own every few seconds. */
  autoCycle?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Interactive Lisko: breathes gently, hops when hovered or tapped, and says the
 * next line in his speech bubble on every tap.
 */
export default function Lisko({ size, messages = [], bubble = "left", autoCycle, className = "", priority }: Props) {
  const [i, setI] = useState(0);
  const [hop, setHop] = useState(0);

  useEffect(() => {
    if (!autoCycle || messages.length < 2) return;
    const id = setInterval(() => { setI(v => (v + 1) % messages.length); setHop(h => h + 1); }, 5000);
    return () => clearInterval(id);
  }, [autoCycle, messages.length]);

  const poke = () => { setHop(h => h + 1); if (messages.length) setI(v => (v + 1) % messages.length); };

  const bubblePos =
    bubble === "top" ? "bottom-full left-1/2 mb-2 -translate-x-1/2" :
    bubble === "top-end" ? "bottom-full right-1 mb-2" :
    bubble === "right" ? "left-[88%] top-[6%]" :
    "right-[88%] top-[6%]";
  const tailPos =
    bubble === "top" ? "left-1/2 -bottom-1.5 -translate-x-1/2" :
    bubble === "top-end" ? "right-8 -bottom-1.5" :
    bubble === "right" ? "-left-1.5 top-4" :
    "-right-1.5 top-4";

  return (
    <button
      type="button"
      onClick={poke}
      onMouseEnter={() => setHop(h => h + 1)}
      aria-label={messages[i] ? `Lisko: ${messages[i]}` : "Lisko"}
      className={`group relative inline-block shrink-0 cursor-pointer select-none outline-none ${className}`}
      style={{ width: size }}
    >
      {messages.length > 0 && (
        <span key={i} className={`bubble-in pointer-events-none absolute z-10 w-max max-w-[190px] rounded-[16px] bg-white px-3.5 py-2 text-left text-[13px] font-semibold leading-snug text-[#2A1E18] shadow-[0_10px_30px_-10px_rgba(110,45,25,0.35)] ${bubblePos}`}>
          {messages[i]}
          <span className={`absolute h-3 w-3 rotate-45 bg-white ${tailPos}`} />
        </span>
      )}
      <span key={hop} className={`block ${hop ? "lisko-hop" : ""}`}>
        <span className="lisko-breathe block">
          <Mascot size={size} title="" priority={priority} className="h-auto w-full drop-shadow-[0_10px_14px_rgba(110,45,25,0.18)]" />
        </span>
      </span>
    </button>
  );
}
