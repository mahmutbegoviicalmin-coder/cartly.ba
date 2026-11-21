import { isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import DashboardClient from "../dashboard/DashboardClient";
import AdminErrorBoundary from "../AdminErrorBoundary";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  if (!isAdmin()) {
    redirect("/admin");
  }

  return (
    <AdminErrorBoundary>
      <DashboardClient />
    </AdminErrorBoundary>
  );
}
