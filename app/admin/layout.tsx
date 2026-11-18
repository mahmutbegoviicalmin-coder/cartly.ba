import type { ReactNode } from "react";
import "./dashboard/dashboard.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  colorScheme: "light" as const,
  themeColor: "#F5F5F7",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ad-shell" style={{ minHeight: "100dvh", background: "#F5F5F7", color: "#1D1D1F" }}>
      {children}
    </div>
  );
}
