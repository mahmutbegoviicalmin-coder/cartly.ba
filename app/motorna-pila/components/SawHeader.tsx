"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SawHeader({ onOrder }: { onOrder: () => void }) {
  return (
    <header className="mp-head">
      <div className="mp-wrap mp-head-inner">
        <Link href="/" className="mp-head-back">
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Nazad</span>
        </Link>
        <div className="mp-head-name">Motorna pila</div>
        <button type="button" className="mp-head-cta" onClick={onOrder}>
          Naruči odmah
        </button>
      </div>
    </header>
  );
}
