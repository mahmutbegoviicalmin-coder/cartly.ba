import { Check } from "lucide-react";

const ITEMS = [
  "4,9 KS snage",
  "Mač 40 cm",
  "Automatsko podmazivanje",
  "Set za održavanje uključen",
  "Dostava 10 KM",
];

export default function TrustStrip() {
  return (
    <div className="mp-strip">
      <div className="mp-wrap mp-strip-grid">
        {ITEMS.map((label) => (
          <div className="mp-strip-item" key={label}>
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
