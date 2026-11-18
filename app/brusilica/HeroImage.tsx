import Image from "next/image";

/**
 * Hero product shot. The source PNG is square with a lot of empty space above
 * and below the tool, so the frame is wide and uses `cover` to crop that space
 * away: the grinder fills almost the full width at every breakpoint.
 */
export default function HeroImage() {
  return (
    <div className="relative mx-[-16px] aspect-[16/10] sm:mx-0 lg:aspect-[7/6]">
      {/* Soft floor shadow */}
      <div
        aria-hidden
        className="absolute bottom-[14%] left-[18%] right-[14%] h-[8%] rounded-[50%] bg-black/25 blur-2xl lg:bottom-[22%]"
      />
      <Image
        src="/brusilica/brusilica-hero.webp"
        alt="Akumulatorska brusilica M18 s baterijom"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 680px"
        className="object-cover object-[50%_48%] lg:scale-[1.05]"
      />
    </div>
  );
}
