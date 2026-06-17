import { getSessions } from "@/app/admin/dashboard/actions";
import AttendeeLandingClient from "./AttendeeLandingClient";

export default async function Page() {
  const result = await getSessions();
  const initialSessions = result.success && result.sessions ? result.sessions : [];

  return <AttendeeLandingClient initialSessions={initialSessions} />;
}
