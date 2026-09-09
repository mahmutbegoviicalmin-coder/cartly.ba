import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Senad O.",
    city: "Travnik",
    stars: 5,
    text: "Imamo dosta drva za zimu, ručna pila je bila problem. Ova napravi posao za sat ono što bi mi trebalo tri sata. Motor pali bez problema, lanac drži.",
  },
  {
    name: "Zlatko P.",
    city: "Banja Luka",
    stars: 5,
    text: "Naručio online, platio kad je dostavljač pokucao na vrata. Pila je stigla dobro upakovana. Probao na hrpi bukve, reže ko mašina.",
  },
  {
    name: "Dženan F.",
    city: "Kakanj",
    stars: 4,
    text: "Solidna pila za ovu cijenu. Jedino što bih rekao je da se malo grije kod dužeg rada, ali to je normalno za benzinsku. Inače zadovoljan.",
  },
  {
    name: "Omer C.",
    city: "Livno",
    stars: 5,
    text: "Kupovao sam i skuplje pile, ova ne zaostaje. Mač od 40 cm je pravi izbor za deblja stabla. Automatsko ulje za lanac radi kako treba, nema curenja.",
  },
  {
    name: "Sabahudin M.",
    city: "Gradačac",
    stars: 5,
    text: "Uzeo za sušare na imanju. Pila je lagana za rukovanje, vidim da je motor solidan. Preporučujem svima koji imaju posla sa drvom.",
  },
  {
    name: "Vlado K.",
    city: "Trebinje",
    stars: 4,
    text: "Sve kako je opisano. Dostava uredno, plaćanje pouzećem. Pila radi bez prigovora, koristim je već par nedjelja.",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="mp-stars" aria-label={`${n} od 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={0}
          fill={i < n ? "#e85c04" : "#e4ddd4"}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  return (
    <section className="mp-section mp-section-alt" id="recenzije">
      <div className="mp-wrap">
        <div className="mp-kicker">Recenzije kupaca</div>
        <h2 className="mp-h2">Šta kažu ljudi koji su već naručili.</h2>

        <div className="mp-rev-stats">
          <div className="mp-rev-score">
            <b>4,8</b>
            <Stars n={5} />
            <span>6 recenzija</span>
          </div>
          <div className="mp-rev-stat">
            <b>500</b>
            <span>zadovoljnih kupaca</span>
          </div>
          <div className="mp-rev-stat">
            <b>5/6</b>
            <span>ocjena 5 zvjezdica</span>
          </div>
          <div className="mp-rev-stat">
            <b>98%</b>
            <span>preporučuje prijatelju</span>
          </div>
        </div>

        <div className="mp-rev-grid">
          {REVIEWS.map((r) => (
            <article className="mp-rev" key={r.name}>
              <header>
                <div className="mp-rev-ava" aria-hidden="true">{r.name[0]}</div>
                <div>
                  <strong>{r.name}</strong>
                  <small>{r.city}</small>
                </div>
                <Stars n={r.stars} />
              </header>
              <p>{r.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
