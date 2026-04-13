import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionDetail } from "@/lib/omnara";
import { SessionContent } from "@/components/SessionContent";

interface Props {
  params: Promise<{ sessionId: string; agentSessionId: string }>;
}

export default async function SessionPage({ params }: Props) {
  const { sessionId, agentSessionId } = await params;

  let detail;
  try {
    detail = await getSessionDetail(sessionId);
  } catch {
    notFound();
  }

  const agentSession = detail.agent_sessions.find(
    (a) => a.session_id === agentSessionId
  );
  if (!agentSession) notFound();

  const workspaceId = detail.workspace?.id;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Sticky nav ────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottom: "1px solid #21262d",
          background: "rgba(13,17,23,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#8b949e",
            textDecoration: "none",
            letterSpacing: "-0.2px",
            flexShrink: 0,
          }}
        >
          ← Back
        </Link>

        <span style={{ color: "#21262d", fontSize: "16px", flexShrink: 0 }}>/</span>

        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#f0f6fc",
            letterSpacing: "-0.4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {detail.session.name ?? "Unnamed Session"}
        </span>
      </header>

      {/* ── Content ───────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        <SessionContent
          sessionId={sessionId}
          agentSessionId={agentSessionId}
          workspaceId={workspaceId}
          initialSession={detail.session}
          initialAgentSession={agentSession}
        />
      </main>
    </div>
  );
}
