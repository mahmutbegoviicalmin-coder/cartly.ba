import { ReactNode, CSSProperties } from "react";

interface Props {
  children:   ReactNode;
  className?: string;
  style?:     CSSProperties;
  /** shared vertical rhythm for all sections */
  spacing?:   "sm" | "md" | "lg";
  bg?:        "white" | "neutral" | "dark" | "none";
}

const BG: Record<string, string> = {
  white:   "bg-white",
  neutral: "bg-[#F5F2EE]",
  dark:    "bg-[#1a1a1a]",
  none:    "",
};

const PY: Record<string, string> = {
  sm: "py-10 md:py-14",
  md: "py-14 md:py-20",
  lg: "py-20 md:py-28",
};

export default function SectionWrapper({
  children,
  className = "",
  style,
  spacing   = "md",
  bg        = "none",
}: Props) {
  return (
    <section className={`w-full ${BG[bg]} ${PY[spacing]} ${className}`} style={style}>
      {children}
    </section>
  );
}
