import { redirect, notFound } from "next/navigation";
import { getSessionDetail } from "@/lib/omnara";

interface Props {
  params: Promise<{ sessionId: string }>;
}

/**
 * Intermediate route: /session/[sessionId]
 *
 * Fetches the session detail and redirects to the most recent agent session.
 * Used when navigating from the home page sessions list (we only have the
 * user session ID at that point).
 */
export default async function SessionIndexPage({ params }: Props) {
  const { sessionId } = await params;

  let detail;
  try {
    detail = await getSessionDetail(sessionId);
  } catch {
    notFound();
  }

  // Pick the most recently active agent session, falling back to first
  const agent =
    detail.agent_sessions.find((a) => a.work_status === "WORKING") ??
    detail.agent_sessions.find((a) => a.connection_status === "CONNECTED") ??
    detail.agent_sessions[0];

  if (!agent) notFound();

  redirect(`/session/${sessionId}/${agent.session_id}`);
}
