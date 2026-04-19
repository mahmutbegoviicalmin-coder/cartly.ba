const reviews = [
  {
    name: "Amir H.",
    rating: 5,
    text: "Nosim ih svaki dan na gradilištu, super udobne i BOA sistem je genijalan.",
  },
  {
    name: "Nedim K.",
    rating: 5,
    text: "Naručio sam u ponedjeljak, stigle u srijedu. Kvalitet odličan za ovu cijenu.",
  },
  {
    name: "Mirza T.",
    rating: 4,
    text: "Odlične za rad u fabrici. Čelična kapica drži kako treba, preporučujem svima.",
  },
  {
    name: "Damir S.",
    rating: 5,
    text: "Već treći par od ovog brenda. Nikad nisam bio razočaran, uvijek iste kvalitete.",
  },
  {
    name: "Kenan B.",
    rating: 5,
    text: "Dostava brza, patike tačno kao na slici. Savršeno pristaju na nogu.",
  },
  {
    name: "Alen F.",
    rating: 5,
    text: "Nosio sam ih cijelu smjenu od 10 sati, noge su mi bile kao da hodam u patikama. Nikad više klasične zaštitne cipele.",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < rating ? "#FF6B00" : "none"}
          stroke="#FF6B00"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section className="bg-[#F5F5F5] border-t border-black/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="flex items-end justify-between mb-10 lg:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A]">
            Šta kupci <span className="text-[#FF6B00]">kažu?</span>
          </h2>
          <span className="text-sm text-black/40 font-medium">6 recenzija</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="bg-white border border-black/10 p-6 flex flex-col gap-3"
            >
              <Stars rating={r.rating} />
              <p className="text-sm text-black/70 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
              <span className="text-sm font-bold text-[#0A0A0A] mt-auto pt-2 border-t border-black/8">
                {r.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
