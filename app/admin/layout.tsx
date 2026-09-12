import type { ReactNode } from "react";
import "./dashboard/dashboard.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  colorScheme: "dark" as const,
  themeColor: "#070708",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ad-shell" style={{ minHeight: "100dvh", background: "#070708", color: "#f5f5f7" }}>
      {children}
    </div>
  );
}
