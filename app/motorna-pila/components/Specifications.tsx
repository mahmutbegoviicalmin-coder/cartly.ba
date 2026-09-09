import { Droplets, Link2, Ruler, Settings, Weight, Zap } from "lucide-react";

const CELLS = [
  { Icon: Zap, value: "4,9 KS", label: "Snaga" },
  { Icon: Ruler, value: "40 cm", label: "Dužina mača" },
  { Icon: Settings, value: "32", label: "Broj zuba" },
  { Icon: Link2, value: ".325", label: "Korak lanca" },
  { Icon: Weight, value: "6,3 kg", label: "Težina" },
  { Icon: Droplets, value: "Automatsko", label: "Podmazivanje" },
];

export default function SpecGrid() {
  return (
    <section className="mp-section mp-section-alt" id="karakteristike">
      <div className="mp-wrap">
        <div className="mp-kicker">Karakteristike</div>
        <h2 className="mp-h2">Brojke koje trebaš prije narudžbe.</h2>
        <p className="mp-copy">
          Benzinski motor 4,9 KS, mač 40 cm i lanac .325 sa 32 zuba. Težina 6,3 kg
          i automatsko podmazivanje. Tačno znaš šta naručuješ.
        </p>
        <div className="mp-spec-grid">
          {CELLS.map(({ Icon, value, label }) => (
            <div className="mp-spec-cell" key={label}>
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
