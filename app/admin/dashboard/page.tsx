import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import AdminErrorBoundary from "../AdminErrorBoundary";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");

  if (session?.value !== "authenticated") {
    redirect("/admin");
  }

  return (
    <AdminErrorBoundary>
      <DashboardClient />
    </AdminErrorBoundary>
  );
}
