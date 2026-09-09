const ITEMS = [
  { n: "01", title: "Motorna pila", text: "Spremna za rad, mač 40 cm i lanac .325." },
  { n: "02", title: "Posuda za miješanje goriva", text: "Za pravilnu mješavinu 25:1, odmah u paketu." },
  { n: "03", title: "Set ključeva za održavanje", text: "Osnovni alat da kreneš bez dodatne kupovine." },
];

export default function PackageContents() {
  return (
    <section className="mp-section mp-section-alt">
      <div className="mp-wrap">
        <div className="mp-kicker">Paket</div>
        <h2 className="mp-h2">Otvoriš kutiju. Možeš odmah na posao.</h2>
        <p className="mp-copy">
          U paketu je motorna pila, posuda za miješanje goriva i set ključeva.
          Nema skrivenih dijelova koje moraš dokupljivati da bi proradila.
        </p>
        <div className="mp-pack-grid">
          {ITEMS.map((item) => (
            <article key={item.n} className="mp-pack-card">
              <div>
                <div className="mp-pack-n">{item.n}</div>
                <div className="mp-pack-title">{item.title}</div>
                <p className="mp-copy" style={{ marginTop: 8 }}>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
