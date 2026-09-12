import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "../dashboard/DashboardClient";
import AdminErrorBoundary from "../AdminErrorBoundary";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const session = cookies().get("admin_session");

  if (session?.value !== "authenticated") {
    redirect("/admin");
  }

  return (
    <AdminErrorBoundary>
      <DashboardClient />
    </AdminErrorBoundary>
  );
}
