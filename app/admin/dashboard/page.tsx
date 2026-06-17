import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { getSessions } from "./actions";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");

  if (!adminAuth || adminAuth.value !== "true") {
    redirect("/admin");
  }

  const result = await getSessions();
  const initialSessions = result.success && result.sessions ? result.sessions : [];

  return <DashboardClient initialSessions={initialSessions} />;
}
