import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "../dashboard/DashboardClient";

export default function AdminOrdersPage() {
  const session = cookies().get("admin_session");

  if (session?.value !== "authenticated") {
    redirect("/admin");
  }

  return <DashboardClient />;
}
