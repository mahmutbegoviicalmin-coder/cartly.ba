export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
