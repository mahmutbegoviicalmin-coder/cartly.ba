import { ReactNode } from "react";

interface Props {
  children:  ReactNode;
  className?: string;
  maxWidth?:  "default" | "wide" | "narrow";
}

const MAX: Record<string, string> = {
  default: "max-w-[1320px]",
  wide:    "max-w-[1440px]",
  narrow:  "max-w-[1024px]",
};

export default function PageContainer({
  children,
  className = "",
  maxWidth  = "default",
}: Props) {
  return (
    <div className={`${MAX[maxWidth]} mx-auto w-full px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
