import Image from "next/image";

/** Lisko, the Cartly fox in a shopping cart. Static version (logo, small badges). */
export const LISKO_RATIO = 640 / 592; // height / width of the cut-out

export const liskoSrc = (width: number) =>
  width <= 72 ? "/lisko/lisko-160.webp" : width <= 150 ? "/lisko/lisko-320.webp" : "/lisko/lisko-640.webp";

export default function Mascot({ size = 64, className = "", title = "Lisko, Cartly maskota", priority }: { size?: number; className?: string; title?: string; priority?: boolean }) {
  return (
    <Image
      src={liskoSrc(size)}
      alt={title}
      aria-hidden={title ? undefined : true}
      width={size}
      height={Math.round(size * LISKO_RATIO)}
      priority={priority}
      className={`select-none ${className}`}
      draggable={false}
    />
  );
}
